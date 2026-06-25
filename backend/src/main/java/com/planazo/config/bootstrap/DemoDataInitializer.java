package com.planazo.config.bootstrap;

import com.planazo.common.constants.Interest;
import com.planazo.common.constants.TravelType;
import com.planazo.plan.Plan;
import com.planazo.plan.PlanRepository;
import com.planazo.plan.PlanVisibility;
import com.planazo.review.Review;
import com.planazo.review.ReviewRepository;
import com.planazo.review.ReviewTarget;
import com.planazo.tourist_place.TouristPlace;
import com.planazo.tourist_place.TouristPlaceRepository;
import com.planazo.user.User;
import com.planazo.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

/**
 * Seeds a clean install with a realistic, self-consistent baseline data set:
 * 5 verified team members, 10 tourist places, 10 plans (with members), and a
 * varied set of venue/user reviews.
 *
 * <p>It mirrors {@link AdminAccountInitializer}: it runs once the context is
 * ready (so the Hibernate {@code ddl-auto=update} schema already exists) and is
 * fully transactional. It is idempotent — it only ever inserts, never updates or
 * deletes existing rows, and skips entirely once the baseline is present.
 */
@Component
@Order(100) // run after the admin/extension bootstrap
public class DemoDataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DemoDataInitializer.class);

    /** Shared dev password for every seeded account (documented in the seed report). */
    private static final String SEED_PASSWORD = "Planazo123";
    private static final String AR_TZ = "America/Argentina/Buenos_Aires";

    private final UserRepository userRepository;
    private final TouristPlaceRepository touristPlaceRepository;
    private final PlanRepository planRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;
    private final SeedLogRepository seedLogRepository;
    private final TransactionTemplate transactionTemplate;
    private final boolean enabled;

    public DemoDataInitializer(
            UserRepository userRepository,
            TouristPlaceRepository touristPlaceRepository,
            PlanRepository planRepository,
            ReviewRepository reviewRepository,
            PasswordEncoder passwordEncoder,
            SeedLogRepository seedLogRepository,
            PlatformTransactionManager transactionManager,
            @Value("${app.seed.demo-data.enabled:true}") boolean enabled) {
        this.userRepository = userRepository;
        this.touristPlaceRepository = touristPlaceRepository;
        this.planRepository = planRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
        this.seedLogRepository = seedLogRepository;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.enabled = enabled;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seed() {
        if (!enabled) {
            log.info("Demo data seeding disabled (app.seed.demo-data.enabled=false).");
            return;
        }
        applyOnce("v1_core_demo", this::seedCore);
        applyOnce("v2_expansion_demo", this::seedExpansion);
    }

    /**
     * Runs a seed batch at most once. The batch body and its version marker commit
     * together in their own transaction, so a failed batch rolls back fully (and is
     * retried on the next boot) and a succeeded batch is never re-applied.
     */
    private void applyOnce(String version, Runnable batch) {
        if (seedLogRepository.existsById(version)) {
            log.info("Seed batch '{}' already applied — skipping.", version);
            return;
        }
        transactionTemplate.executeWithoutResult(status -> {
            batch.run();
            seedLogRepository.save(new SeedLog(version));
        });
        log.info("Seed batch '{}' applied.", version);
    }

    private void seedCore() {
        List<User> team = ensureTeam();
        List<TouristPlace> places = seedTouristPlaces(team);
        seedPlans(team);
        seedVenueReviews(team, places);
        seedUserReviews(team);
        log.info("Core batch: ensured {} users and {} tourist places.", team.size(), places.size());
    }

    // ---------------------------------------------------------------------
    // Users
    // ---------------------------------------------------------------------

    private List<User> ensureTeam() {
        User seba = ensureUser("sebaskrag@gmail.com", "Sebastian", "Kraglievich", "male",
                LocalDate.of(2001, 10, 20), List.of(Interest.FOOD, Interest.CULTURE, Interest.NIGHTLIFE),
                TravelType.FRIENDS, List.of("English"));
        User marcos = ensureUser("marcosgneira73@gmail.com", "Marcos", "García Neira", "prefer not to say",
                LocalDate.of(2003, 10, 31), List.of(Interest.NATURE, Interest.ADVENTURE, Interest.MOUNTAINS),
                TravelType.SOLO, List.of("Spanish"));
        User rocio = ensureUser("rociokraska@gmail.com", "Rocío", "Kraska", "female",
                LocalDate.of(2004, 6, 1), List.of(Interest.CULTURE, Interest.HISTORY, Interest.SHOPPING),
                TravelType.COUPLE, List.of("English"));
        User bryan = ensureUser("bryanserrantes8a@gmail.com", "Bryan", "Serrantes Ochoa", "male",
                LocalDate.of(1999, 9, 8), List.of(Interest.SPORTS, Interest.BEACH, Interest.ADVENTURE),
                TravelType.FRIENDS, List.of("Spanish"));
        User emanuel = ensureUser("manu.perez.11.01@gmail.com", "Emanuel", "Perez", "other",
                LocalDate.of(2000, 5, 30), List.of(Interest.FOOD, Interest.NATURE, Interest.CULTURE),
                TravelType.SOLO, List.of("English"));
        return List.of(seba, marcos, rocio, bryan, emanuel);
    }

    private User ensureUser(String email, String name, String lastname, String gender,
                            LocalDate birthDate, List<Interest> interests,
                            TravelType travelType, List<String> languages) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User(name, passwordEncoder.encode(SEED_PASSWORD), gender, email, lastname,
                    "", "USER", birthDate, interests, travelType, languages);
            user.setVerified(true);
            user.setPreferredLanguage("en");
            return userRepository.save(user);
        });
    }

    // ---------------------------------------------------------------------
    // Tourist places
    // ---------------------------------------------------------------------

    private List<TouristPlace> seedTouristPlaces(List<User> team) {
        User seba = team.get(0), marcos = team.get(1), rocio = team.get(2), bryan = team.get(3), emanuel = team.get(4);

        TouristPlace obelisco = place(seba, "Obelisco de Buenos Aires", 0.0, null, null,
                List.of(Interest.CULTURE, Interest.HISTORY), "Argentina", "Buenos Aires", "Av. 9 de Julio s/n",
                -34.6037, -58.3816,
                "The 67-metre obelisk on Avenida 9 de Julio is the city's most recognisable landmark. The plaza around it fills up after every big football win — go early if you want a clean photo.",
                List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782396911/Buenos_Aires__20234294752_etpxl1.jpg")  );

        TouristPlace iguazu = place(marcos, "Cataratas del Iguazú", 35.0, 6, null,
                List.of(Interest.NATURE, Interest.ADVENTURE), "Argentina", "Puerto Iguazú", "Parque Nacional Iguazú",
                -25.6953, -54.4367,
                "A system of 275 waterfalls on the border with Brazil. The Garganta del Diablo walkway puts you right at the edge of the roar — bring a poncho, you will get soaked.",
                List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782399643/images_pgv3sy.jpg"));

        TouristPlace peritoMoreno = place(marcos, "Glaciar Perito Moreno", 45.0, null, null,
                List.of(Interest.NATURE, Interest.MOUNTAINS), "Argentina", "El Calafate", "Parque Nacional Los Glaciares",
                -50.4967, -73.1377,
                "One of the few advancing glaciers in the world. From the balconies you can hear blocks of ice crack and collapse into the lake. Dress for wind even in summer.",
                List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782399743/minitrekking-glaciar-el-calafate-1_zm9e11.jpg"));

        TouristPlace caminito = place(rocio, "Caminito, La Boca", 0.0, null, null,
                List.of(Interest.CULTURE, Interest.HISTORY, Interest.SHOPPING), "Argentina", "Buenos Aires", "Caminito, La Boca",
                -34.6395, -58.3625,
                "A short, colourful street museum in La Boca with tango dancers and corrugated-metal houses painted every colour imaginable. Touristy but genuinely fun in the afternoon.",
                List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782399798/caminito_q1vb1i.jpg"));

        TouristPlace aconcagua = place(bryan, "Cerro Aconcagua", 50.0, 16, null,
                List.of(Interest.MOUNTAINS, Interest.ADVENTURE, Interest.SPORTS), "Argentina", "Mendoza", "Parque Provincial Aconcagua",
                -32.6533, -70.0109,
                "The highest peak in the Americas at 6,961 m. You don't need to summit — the entrance trails to Laguna de Horcones give you the views without the altitude permit.",
                List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782399840/cerro_imad6o.jpg"));

        TouristPlace bodega = place(rocio, "Bodega en Luján de Cuyo", 28.0, 18, null,
                List.of(Interest.FOOD, Interest.CULTURE), "Argentina", "Mendoza", "Luján de Cuyo",
                -33.0386, -68.8794,
                "Classic Malbec country at the foot of the Andes. Most wineries offer a guided tour plus a three-glass tasting; book the lunch pairing if you can, it is worth the extra.",
                List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782409099/bodega_l_xv2plk.jpg"));

        TouristPlace catedral = place(bryan, "Cerro Catedral, Bariloche", 60.0, null, null,
                List.of(Interest.MOUNTAINS, Interest.SPORTS, Interest.NATURE), "Argentina", "San Carlos de Bariloche", "Cerro Catedral",
                -41.1667, -71.4333,
                "The largest ski resort in South America in winter, and a great hiking and chairlift spot the rest of the year. The view over Lago Gutiérrez from the top is the postcard everyone takes.",
                List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782399889/bodegalujan_rlyejf.jpg"));

        TouristPlace humahuaca = place(emanuel, "Quebrada de Humahuaca", 10.0, null, null,
                List.of(Interest.NATURE, Interest.HISTORY, Interest.CULTURE), "Argentina", "Jujuy", "Purmamarca",
                -23.7450, -65.5000,
                "A UNESCO valley of layered, multicoloured rock. The Cerro de los Siete Colores above Purmamarca glows best in the early morning light, before the tour buses arrive.",
                List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782399933/cerrocatedra_jyugze.jpg"));

        TouristPlace colon = place(rocio, "Teatro Colón", 22.0, null, null,
                List.of(Interest.CULTURE, Interest.HISTORY), "Argentina", "Buenos Aires", "Cerrito 628",
                -34.6010, -58.3835,
                "One of the world's great opera houses, with acoustics musicians rave about. The guided backstage tour is excellent even if you don't catch a performance.",
                List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782399973/6f_otbjj9.jpg"));

        TouristPlace ischigualasto = place(emanuel, "Valle de la Luna (Ischigualasto)", 30.0, null, null,
                List.of(Interest.NATURE, Interest.ADVENTURE), "Argentina", "San Juan", "Parque Provincial Ischigualasto",
                -29.9000, -67.8333,
                "A desert moonscape of wind-carved rock and one of the richest dinosaur fossil sites on Earth. Go for the full-moon night tour if the dates line up — it is unforgettable.",
                List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400016/valledelaluna_c0wygm.jpg"));

        return List.of(obelisco, iguazu, peritoMoreno, caminito, aconcagua,
                bodega, catedral, humahuaca, colon, ischigualasto);
    }

    private TouristPlace place(User creator, String name, Double cost, Integer minAge, Integer maxAge,
                                List<Interest> interests, String country, String city, String address,
                                double lat, double lng, String description, List<String> images) {
        TouristPlace place = new TouristPlace(name, cost, minAge, maxAge, interests,
                country, city, address, lat, lng, images);
        place.setDescription(description);
        place.setCreator(creator);
        return touristPlaceRepository.save(place);
    }

    // ---------------------------------------------------------------------
    // Plans
    // ---------------------------------------------------------------------

    private List<Plan> seedPlans(List<User> team) {
        User seba = team.get(0), marcos = team.get(1), rocio = team.get(2), bryan = team.get(3), emanuel = team.get(4);
        
        // Get all users from database for random creators
        List<User> allUsers = userRepository.findAll();
        Random rng = new Random(20260625L);

        Plan p1 = plan(seba, "Asado y fútbol en Palermo",
                "Casual Sunday asado before the Boca match. Bring something to share — we cover the meat and the fire.",
                dt(2026, 7, 12, 13, 0), dt(2026, 7, 12, 19, 0), PlanVisibility.PUBLIC, 20, 18, null,
                List.of(Interest.FOOD, Interest.SPORTS), "Argentina", "Buenos Aires", "Parque Tres de Febrero, Palermo",
                -34.5711, -58.4173, 8000.0, List.of(marcos, bryan, emanuel), 
                List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782410450/Gemini_Generated_Image_osoyo4osoyo4osoy_pyaqsr.png",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782410454/p12_n8gts3.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782410458/p1_mg85ub.jpg"
                ));

        Plan p2 = plan(marcos, "Trekking a la Laguna de los Tres",
                "Full-day hike to the base of Mount Fitz Roy. Moderate-to-hard, ~10h round trip. Decent boots required.",
                dt(2026, 8, 9, 6, 30), dt(2026, 8, 9, 18, 0), PlanVisibility.PUBLIC, 12, 16, null,
                List.of(Interest.NATURE, Interest.MOUNTAINS, Interest.ADVENTURE), "Argentina", "El Chaltén", "Sendero Laguna de los Tres",
                -49.3300, -72.8860, 15000.0, List.of(bryan, emanuel), 
                List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782410624/p2_xxf27b.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782410628/p23_yjd98z.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782410621/p22_sw9pvv.jpg"
                ));

        Plan p3 = plan(rocio, "Noche de ópera en el Colón",
                "We grabbed a block of seats for the season's Traviata. Smart-casual dress, dinner nearby afterwards.",
                dt(2026, 9, 3, 20, 0), dt(2026, 9, 3, 23, 30), PlanVisibility.PUBLIC, 8, 18, null,
                List.of(Interest.CULTURE, Interest.HISTORY), "Argentina", "Buenos Aires", "Teatro Colón, Cerrito 628",
                -34.6010, -58.3835, 22000.0, List.of(seba, emanuel), 
                List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782410796/colon2_nrvsao.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782410800/colon3_oawyog.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782410793/colon_cgdm3y.jpg"
                ));

        Plan p4 = plan(bryan, "Día de ski en Cerro Catedral",
                "Mid-week ski day to dodge the crowds. Carpooling from Bariloche centre at 8am. All levels welcome.",
                dt(2026, 7, 22, 8, 0), dt(2026, 7, 22, 17, 0), PlanVisibility.PUBLIC, 16, null, null,
                List.of(Interest.SPORTS, Interest.MOUNTAINS), "Argentina", "San Carlos de Bariloche", "Cerro Catedral",
                -41.1667, -71.4333, 45000.0, List.of(marcos, seba), 
                List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782410903/dia-de-ski-en-cerro-catedral_47796_202507071715330_f2ekwe.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782410895/0_ugxpjv.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782410899/3-dias-de-ski-en-cerro-catedral_2403_201706021317020.Mobile_a0dzqg.jpg"
                ));

        Plan p5 = plan(emanuel, "Tour de bodegas en Mendoza",
                "Three wineries in Luján de Cuyo with a long lunch in the middle. We split a driver so everyone can taste.",
                dt(2026, 10, 4, 10, 0), dt(2026, 10, 4, 18, 0), PlanVisibility.PUBLIC, 10, 18, null,
                List.of(Interest.FOOD, Interest.CULTURE), "Argentina", "Mendoza", "Luján de Cuyo",
                -33.0386, -68.8794, 30000.0, List.of(seba, rocio), 
                List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782411005/df_nrtp3a.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782411009/mendoza_0_202011300955440_bnqnba.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782410997/04_zgkm5e.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782411001/16897a44-787d-4fdf-9d8f-deaf5d606ec4_cjz2ma.avif"
                ));

        Plan p6 = plan(seba, "Recorrida foodie en San Telmo",
                "Sunday market crawl: empanadas, choripán, and the best dulce de leche stalls. Cash helps at the fair.",
                dt(2026, 7, 19, 11, 0), dt(2026, 7, 19, 16, 0), PlanVisibility.PUBLIC, 15, null, null,
                List.of(Interest.FOOD, Interest.CULTURE, Interest.SHOPPING), "Argentina", "Buenos Aires", "Feria de San Telmo, Defensa 900",
                -34.6208, -58.3735, 12000.0, List.of(rocio, emanuel, marcos), 
                List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782411091/p3_vzgyfj.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782411096/d8_utns2r.jpg"
                ));

        Plan p7 = plan(marcos, "Avistaje y caminata en Iguazú",
                "Two days at the falls: Argentine side on day one, the boat under the falls on day two. Ponchos provided.",
                dt(2026, 9, 19, 9, 0), dt(2026, 9, 20, 17, 0), PlanVisibility.PUBLIC, 14, 8, null,
                List.of(Interest.NATURE, Interest.ADVENTURE), "Argentina", "Puerto Iguazú", "Parque Nacional Iguazú",
                -25.6953, -54.4367, 38000.0, List.of(emanuel, bryan), 
                List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782411175/ig_pbmouj.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782411171/img1_dblmzq.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782411167/0000_wpxpdo.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782411163/2222_ynyin2.jpg"
                ));

        Plan p8 = plan(rocio, "Tarde de tango en La Boca",
                "Caminito stroll, a milonga lesson for total beginners, and coffee with a view of the river.",
                dt(2026, 8, 16, 15, 0), dt(2026, 8, 16, 20, 0), PlanVisibility.PUBLIC, 18, null, null,
                List.of(Interest.CULTURE, Interest.HISTORY), "Argentina", "Buenos Aires", "Caminito, La Boca",
                -34.6395, -58.3625, 9000.0, List.of(seba, emanuel), 
                List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782411275/tang_izmyga.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782411270/tang2_ndsl7x.jpg"
                ));

        Plan p9 = plan(bryan, "Escapada de surf a Mar del Plata",
                "Weekend of beginner surf lessons and beach volley. Boards and wetsuits rented on site.",
                dt(2026, 11, 7, 9, 0), dt(2026, 11, 8, 18, 0), PlanVisibility.PUBLIC, 12, 16, 45,
                List.of(Interest.BEACH, Interest.SPORTS, Interest.ADVENTURE), "Argentina", "Mar del Plata", "Playa Grande",
                -38.0500, -57.5300, 26000.0, List.of(seba, marcos),
                 List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782411346/123_qjemzs.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782411350/010203_vqqbyr.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782411341/0102_exzzrq.jpg"
                 ));

        Plan p10 = plan(emanuel, "Amanecer en Purmamarca",
                "Early start to catch the Cerro de los Siete Colores at sunrise, then a slow breakfast in the village.",
                dt(2026, 10, 25, 6, 0), dt(2026, 10, 25, 11, 0), PlanVisibility.PRIVATE, 8, null, null,
                List.of(Interest.NATURE, Interest.HISTORY), "Argentina", "Purmamarca", "Cerro de los Siete Colores",
                -23.7450, -65.5000, 7000.0, List.of(marcos, rocio), 
                List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782411449/p10_advyub.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782411452/p102_arrjnv.jpg"
                ));
        Plan p11 = plan(allUsers.get(rng.nextInt(allUsers.size())), 
        "Recorrida de tiendas en Buenos Aires",
            "A friendly get-together to enjoy Mercado de San Telmo without rushing.",
            dt(2026, 7, 12, 11, 0), dt(2026, 7, 12, 16, 0),
            PlanVisibility.PRIVATE, 30, null, 5000,
            List.of(), "Argentina", "Buenos Aires",
            "Mercado de San Telmo",
            -34.6206, -58.3716, 300,
            List.of(marcos, rocio),
            List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782413526/rec_ayyfvh.jpg"));

        Plan p12 = plan(allUsers.get(rng.nextInt(allUsers.size())), 
        "Día de museos en Buenos Aires",
                "Group plan at Usina del Arte; bring good vibes and comfy shoes.",
                dt(2026, 7, 13, 12, 0), dt(2026, 11, 02, 18, 0),
                PlanVisibility.PUBLIC, 35, null, 7500,
                List.of(), "Argentina", "Buenos Aires",
                "Usina del Arte",
                -34.6286, -58.3568, 360,
                List.of(seba),
                List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782413579/flyer-nochedelosmuseos-lineup-historico_hpw7ia.png",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782413611/mus_jixvu6.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782413609/mus_hctzcy.jpg"
                    
                ));

        Plan p13 = plan(allUsers.get(rng.nextInt(allUsers.size())), "Caminata y naturaleza en Buenos Aires",
                "Discovering Reserva Ecológica Costanera Sur together and grabbing a bite nearby afterwards.",
                dt(2026, 7, 14, 13, 0), dt(2026, 7, 14, 16, 0),
                PlanVisibility.PUBLIC, 10, 18, 10000,
                List.of(), "Argentina", "Buenos Aires",
                "Reserva Ecológica Costanera Sur",
                -34.612, -58.35, 180,
                List.of(seba, marcos),
                List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782413778/90_pieaqu.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782413777/91_w4jn2t.jpg"
                ));

        Plan p14 = plan(allUsers.get(rng.nextInt(allUsers.size())), "Recorrido de arte en Buenos Aires",
                "A friendly get-together to enjoy Centro Cultural Kirchner without rushing.",
                dt(2026, 7, 15, 14, 0), dt(2026, 7, 15, 18, 0),
                PlanVisibility.PUBLIC, 15, null, 12500,
                List.of(), "Argentina", "Buenos Aires",
                "Centro Cultural Kirchner",
                -34.6075, -58.3702, 240,
                List.of(),
                List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782413869/c3_mesaf1.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782413870/e3_kwyqsg.jpg"
                ));

        Plan p15 = plan(allUsers.get(rng.nextInt(allUsers.size())), "Paseo por el Estadio Monumental",
                "Group plan at Estadio Monumental; bring good vibes and comfy shoes.",
                dt(2026, 7, 16, 15, 0), dt(2026, 7, 16, 20, 0),
                PlanVisibility.PUBLIC, 20, null, 15000,
                List.of(), "Argentina", "Buenos Aires",
                "Estadio Monumental",
                -34.5453, -58.4498, 300,
                List.of(),
                List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782414004/visita-estadios-monumental-y-bombonera-river-y-boca_42_202406280957240.Mobile_oy35jp.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782414006/mun_buci2o.jpg"
                ));

        Plan p16 = plan(allUsers.get(rng.nextInt(allUsers.size())), "Partido y deporte en Buenos Aires",
                "Exploring La Bombonera at an easy pace, with plenty of time to chat.",
                dt(2026, 7, 17, 16, 0), dt(2026, 7, 17, 22, 0),
                PlanVisibility.PRIVATE, 25, null, 17500,
                List.of(), "Argentina", "Buenos Aires",
                "La Bombonera",
                -34.6356, -58.3647, 360,
                List.of(),
                List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782414062/bomb_szuqm3.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782414064/33_obxfek.jpg"
                ));

        Plan p17 = plan(allUsers.get(rng.nextInt(allUsers.size())), "Noche de sabores en Buenos Aires",
                "Discovering Barrio Chino de Belgrano together and grabbing a bite nearby afterwards.",
                dt(2026, 7, 18, 9, 0), dt(2026, 7, 18, 12, 0),
                PlanVisibility.PUBLIC, 30, 18, 20000,
                List.of(), "Argentina", "Buenos Aires",
                "Barrio Chino de Belgrano",
                -34.561, -58.454, 180,
                List.of(),
                List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782414123/1_na8lon.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782414121/chine_cy7shq.jpg"
                ));

        Plan p18 = plan(allUsers.get(rng.nextInt(allUsers.size())), "Recorrida de tiendas en Buenos Aires",
                "Group plan at Galerías Pacífico; bring good vibes and comfy shoes.",
                dt(2026, 7, 19, 10, 0), dt(2026, 7, 19, 14, 0),
                PlanVisibility.PUBLIC, 35, null, 22500,
                List.of(), "Argentina", "Buenos Aires",
                "Galerías Pacífico",
                -34.601, -58.375, 240,
                List.of(),
                List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782414197/1762789578691208ca2985e691208ca29860_fpci4s.jpg"
                ));

        Plan p19 = plan(allUsers.get(rng.nextInt(allUsers.size())), "Tarde cultural en Buenos Aires",
                "Exploring Avenida Corrientes at an easy pace, with plenty of time to chat.",
                dt(2026, 7, 20, 11, 0), dt(2026, 7, 20, 16, 0),
                PlanVisibility.PUBLIC, 10, null, 25000,
                List.of(), "Argentina", "Buenos Aires",
                "Avenida Corrientes",
                -34.6038, -58.385, 300,
                List.of(),
                List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782414260/avcor_qwo9sm.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782414262/03_xpv04p.jpg"
                ));

        Plan p20 = plan(allUsers.get(rng.nextInt(allUsers.size())), "Recorrido histórico por Buenos Aires",
                "Meeting up around Congreso de la Nación for a relaxed few hours together.",
                dt(2026, 7, 21, 12, 0), dt(2026, 7, 21, 18, 0),
                PlanVisibility.PUBLIC, 15, null, 27500,
                List.of(), "Argentina", "Buenos Aires",
                "Congreso de la Nación",
                -34.6097, -58.3925, 360,
                List.of(emanuel, rocio, seba, marcos, bryan),
                List.of(
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782414325/14_gmjknc.jpg",
                    "https://res.cloudinary.com/p5hffsjm/image/upload/v1782414328/Pasos-Perdidos-La-Noche-de-los-Museos-visto-desde-arriba-1024x683_xs1njl.jpg"
                ));


        return List.of(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20);
    }

    private Plan plan(User creator, String title, String description,
                      LocalDateTime start, LocalDateTime end, PlanVisibility visibility,
                      Integer maxSubscribers, Integer minAge, Integer maxAge,
                      List<Interest> interests, String country, String city, String address,
                      double lat, double lng, double budget, List<User> members, List<String> images) {
        Plan plan = new Plan(title, description, start, end, visibility, maxSubscribers, minAge, maxAge,
                interests, country, city, address, lat, lng, images, creator, AR_TZ);
        plan.setBudget(budget);
        // Persist first so the generated id backs the @MapsId subscriber key.
        plan = planRepository.save(plan);
        for (User member : members) {
            if (plan.addSubscriber(member, true)) {
                plan.incrementSubscriberCount();
            }
        }
        return planRepository.save(plan);
    }

    // ---------------------------------------------------------------------
    // Reviews
    // ---------------------------------------------------------------------

    private void seedVenueReviews(List<User> team, List<TouristPlace> places) {
        User seba = team.get(0), marcos = team.get(1), rocio = team.get(2), bryan = team.get(3), emanuel = team.get(4);
        TouristPlace obelisco = places.get(0), iguazu = places.get(1), peritoMoreno = places.get(2),
                caminito = places.get(3), aconcagua = places.get(4), bodega = places.get(5),
                catedral = places.get(6), humahuaca = places.get(7), colon = places.get(8), ischigualasto = places.get(9);

        // Iguazú — well reviewed, mixed.
        venueReview(marcos, iguazu, 5, "Absolutely worth the trip. Standing at the Garganta del Diablo is something photos never capture. Go on a weekday if you can.");
        venueReview(bryan, iguazu, 5, "Did the boat ride under the falls — soaked to the bone and grinning the whole time. Bring a dry bag for your phone.");
        venueReview(rocio, iguazu, 4, "Stunning, but the main walkways get crowded by midday. Get there at opening and do the lower circuit first.");

        // Perito Moreno.
        venueReview(marcos, peritoMoreno, 5, "Watching a chunk of ice the size of a building calve into the lake is unreal. Stayed two hours just listening to it crack.");
        venueReview(emanuel, peritoMoreno, 4, "Breathtaking, though the wind on the balconies is brutal. Worth every layer you can carry.");

        // Bodega.
        venueReview(seba, bodega, 5, "The Malbec lunch pairing was the highlight of our Mendoza trip. Knowledgeable guide, generous pours.");
        venueReview(rocio, bodega, 4, "Lovely setting with the Andes in the background. The basic tasting felt a bit short — upgrade to the reserve flight.");

        // Catedral.
        venueReview(bryan, catedral, 5, "Best snow I've had in years and the top view over the lakes is unbeatable. Rentals were quick too.");
        venueReview(seba, catedral, 3, "Great mountain, but the lift queues on a Saturday were rough. Come midweek and it's a different place.");

        // Teatro Colón.
        venueReview(rocio, colon, 5, "The acoustics live up to the legend. Even the backstage tour gave me chills.");
        venueReview(emanuel, colon, 5, "Saw a ballet here and the whole room felt electric. A piece of living history.");

        // Single, varied reviews across the rest.
        venueReview(emanuel, humahuaca, 5, "The seven-colour hill at sunrise stopped me in my tracks. The whole valley feels otherworldly.");
        venueReview(seba, obelisco, 3, "It's the heart of the city and great for people-watching, but it's really just a quick photo stop.");
        venueReview(rocio, caminito, 4, "Colourful and full of life. Yes it's touristy, but the tango dancers make it genuinely charming.");
        venueReview(bryan, aconcagua, 4, "Didn't summit, just hiked to the lagoon — the scale of the peak is humbling. Acclimatise before you push higher.");
        venueReview(marcos, ischigualasto, 5, "The full-moon tour was magical, like walking on another planet. Book ahead, spots vanish fast.");
    }

    private void seedUserReviews(List<User> team) {
        User seba = team.get(0), marcos = team.get(1), rocio = team.get(2), bryan = team.get(3), emanuel = team.get(4);

        userReview(marcos, seba, 5, "Sebastian organised a flawless asado and made sure everyone felt included. Would join any plan he hosts.");
        userReview(bryan, seba, 4, "Great host and easy-going. Things ran a little late but nobody minded.");
        userReview(seba, marcos, 5, "Marcos knows the mountains inside out and kept a sensible pace. Felt safe the whole hike.");
        userReview(emanuel, marcos, 5, "Super organised and encouraging with beginners. Learned a ton on the trek.");
        userReview(rocio, bryan, 4, "Bryan is great fun and very on top of logistics. Carpool was perfectly arranged.");
        userReview(seba, bryan, 5, "Reliable and always up for an adventure. The ski day he planned was spot on.");
        userReview(emanuel, rocio, 5, "Rocio picked the perfect seats and the dinner afterwards was a lovely touch. Wonderful company.");
        userReview(seba, rocio, 4, "Thoughtful planner with great taste. The evening flowed without a hitch.");
        userReview(marcos, emanuel, 5, "Emanuel's sunrise plan was worth the early alarm. Calm, warm and very well prepared.");
        userReview(bryan, emanuel, 4, "Easy to get along with and punctual. The breakfast spot she chose was a gem.");
    }

    private void venueReview(User author, TouristPlace place, int rating, String comment) {
        if (reviewRepository.findByUserIdAndTargetTypeAndTargetId(author.getId(), ReviewTarget.VENUE, place.getId()).isPresent()) {
            return;
        }
        reviewRepository.save(new Review(author, rating, comment, ReviewTarget.VENUE, place.getId()));
    }

    private void userReview(User author, User target, int rating, String comment) {
        if (reviewRepository.findByUserIdAndTargetTypeAndTargetId(author.getId(), ReviewTarget.USER, target.getId()).isPresent()) {
            return;
        }
        reviewRepository.save(new Review(author, rating, comment, ReviewTarget.USER, target.getId()));
    }

    private static LocalDateTime dt(int year, int month, int day, int hour, int minute) {
        return LocalDateTime.of(year, month, day, hour, minute);
    }

    // ---------------------------------------------------------------------
    // Expansion batch (v2): 35 users, 90 places, 90 plans, reviews up to 400/400.
    // ---------------------------------------------------------------------

    private void seedExpansion() {
        Random rng = new Random(20260625L);

        // 35 new users (idempotent by email), remembering each persona's voice.
        List<User> newUsers = new ArrayList<>();
        Map<Long, String> personalityByUserId = new HashMap<>();
        for (SeedData.PersonaSpec spec : SeedData.PERSONAS) {
            User user = ensurePersona(spec);
            newUsers.add(user);
            personalityByUserId.put(user.getId(), spec.personality());
        }

        // 90 new places from the catalog, attributed to the new users.
        List<TouristPlace> newPlaces = new ArrayList<>();
        int idx = 0;
        for (SeedData.PlaceSpec spec : SeedData.PLACES) {
            User creator = newUsers.get(idx % newUsers.size());
            newPlaces.add(createPlace(spec, creator));
            idx++;
        }

        // Expansion plans removed - using manual plans with random creators instead.

        // Top reviews up to 400 venue + 400 user, authored by the new users.
        List<User> allUsers = userRepository.findAll();
        List<TouristPlace> allPlaces = touristPlaceRepository.findAll();
        seedExpansionReviews(newUsers, allUsers, allPlaces, personalityByUserId, rng);

        log.info("Expansion batch: added {} users and {} tourist places.", newUsers.size(), newPlaces.size());
    }

    private User ensurePersona(SeedData.PersonaSpec s) {
        return userRepository.findByEmail(s.email()).orElseGet(() -> {
            User user = new User(s.firstName(), passwordEncoder.encode(SEED_PASSWORD), s.gender(), s.email(),
                    s.lastName(), "", "USER", s.birthDate(), s.interests(), s.travelType(), s.languages());
            user.setVerified(true);
            user.setPreferredLanguage("en");
            return userRepository.save(user);
        });
    }

    private TouristPlace createPlace(SeedData.PlaceSpec s, User creator) {
        TouristPlace place = new TouristPlace(s.name(), s.cost(), null, null, s.interests(),
                s.country(), s.city(), s.address(), s.lat(), s.lng(), s.images());
        place.setDescription(s.description());
        place.setCreator(creator);
        return touristPlaceRepository.save(place);
    }

    private void seedExpansionPlans(List<User> users, List<TouristPlace> places, Random rng) {
        LocalDateTime base = LocalDateTime.of(2026, 7, 1, 0, 0);

        // Pick exactly 90 plan host places so that, combined with the base plans
        // (4 CABA + 6 provinces), the global plan distribution lands on the same
        // 60% AR / 40% world and, within AR, 60% CABA / 40% provinces. The new
        // places are 33 CABA + 17 provinces + 40 world; new plans must therefore be
        // 32 CABA + 18 provinces + 40 world (one province place hosts two plans, one
        // CABA place hosts none).
        List<TouristPlace> caba = new ArrayList<>();
        List<TouristPlace> prov = new ArrayList<>();
        List<TouristPlace> world = new ArrayList<>();
        for (TouristPlace pl : places) {
            if (!"Argentina".equals(pl.getCountry())) world.add(pl);
            else if ("Buenos Aires".equals(pl.getCity())) caba.add(pl);
            else prov.add(pl);
        }
        List<TouristPlace> hosts = new ArrayList<>();
        if (caba.size() >= 32 && !prov.isEmpty()) {
            hosts.addAll(caba.subList(0, 32));
            hosts.addAll(prov);
            hosts.add(prov.get(0));
            hosts.addAll(world);
        } else {
            hosts.addAll(places); // safe fallback: one plan per place
        }

        int i = 0;
        for (TouristPlace place : hosts) {
            User creator = users.get(i % users.size());
            List<User> members = new ArrayList<>();
            for (int k = 1; k <= 3; k++) {
                members.add(users.get((i + k) % users.size()));
            }
            Interest primary = place.getInterests().isEmpty() ? Interest.OTHER : place.getInterests().get(0);
            String title = SeedData.planTitle(primary, place.getCity(), rng);
            String description = SeedData.planDescription(place.getName(), rng);
            LocalDateTime start = base.plusDays(i + 1L).withHour(9 + (i % 8)).withMinute(0);
            LocalDateTime end = start.plusHours(3L + (i % 4));
            PlanVisibility visibility = (i % 5 == 0) ? PlanVisibility.PRIVATE : PlanVisibility.PUBLIC;
            Integer minAge = (i % 4 == 0) ? 18 : null;
            Integer maxSubscribers = 10 + (i % 6) * 5;
            double budget = 5000.0 + (i % 10) * 2500.0;
            String tz = "Argentina".equals(place.getCountry()) ? AR_TZ : "UTC";

            Plan plan = new Plan(title, description, start, end, visibility, maxSubscribers, minAge, null,
                    place.getInterests(), place.getCountry(), place.getCity(), place.getAddress(),
                    place.getLatitude(), place.getLongitude(), List.of(), creator, tz);
            plan.setBudget(budget);
            plan = planRepository.save(plan);
            for (User member : members) {
                if (plan.addSubscriber(member, true)) {
                    plan.incrementSubscriberCount();
                }
            }
            planRepository.save(plan);
            i++;
        }
    }

    private void seedExpansionReviews(List<User> authors, List<User> allUsers, List<TouristPlace> places,
                                      Map<Long, String> personalityByUserId, Random rng) {
        int venueNeeded = (int) Math.max(0L, 400 - reviewRepository.countByTargetType(ReviewTarget.VENUE));
        int userNeeded = (int) Math.max(0L, 400 - reviewRepository.countByTargetType(ReviewTarget.USER));

        // VENUE reviews — authored by the new users over any place. Their authors
        // never overlap the base reviews (whose authors are the original team), so
        // there is no UNIQUE collision.
        int created = 0;
        Set<String> used = new HashSet<>();
        for (int round = 0; round < places.size() && created < venueNeeded; round++) {
            for (int a = 0; a < authors.size() && created < venueNeeded; a++) {
                User author = authors.get(a);
                TouristPlace place = places.get((a + round) % places.size());
                if (!used.add(author.getId() + ":" + place.getId())) continue;
                if (reviewRepository.findByUserIdAndTargetTypeAndTargetId(author.getId(), ReviewTarget.VENUE, place.getId()).isPresent()) {
                    continue;
                }
                int rating = SeedData.weightedRating(SeedData.ratingWeights(personalityByUserId.get(author.getId())), rng);
                String comment = SeedData.venueComment(rating, place.getName(), rng);
                reviewRepository.save(new Review(author, rating, comment, ReviewTarget.VENUE, place.getId()));
                created++;
            }
        }

        // USER reviews — authored by the new users, targeting any other user (never
        // themselves; never overlapping the base user reviews).
        created = 0;
        used.clear();
        for (int round = 0; round < allUsers.size() && created < userNeeded; round++) {
            for (int a = 0; a < authors.size() && created < userNeeded; a++) {
                User author = authors.get(a);
                User target = allUsers.get((a + round) % allUsers.size());
                if (target.getId().equals(author.getId())) continue;
                if (!used.add(author.getId() + ":" + target.getId())) continue;
                if (reviewRepository.findByUserIdAndTargetTypeAndTargetId(author.getId(), ReviewTarget.USER, target.getId()).isPresent()) {
                    continue;
                }
                int rating = SeedData.weightedRating(SeedData.ratingWeights(personalityByUserId.get(author.getId())), rng);
                String comment = SeedData.userComment(rating, target.getName(), rng);
                reviewRepository.save(new Review(author, rating, comment, ReviewTarget.USER, target.getId()));
                created++;
            }
        }
    }
}
