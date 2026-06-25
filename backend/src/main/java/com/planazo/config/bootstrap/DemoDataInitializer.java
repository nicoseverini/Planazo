package com.planazo.config.bootstrap;

import com.planazo.common.constants.Interest;
import com.planazo.common.constants.TravelType;
import com.planazo.plan.Plan;
import com.planazo.plan.PlanRepository;
import com.planazo.plan.PlanVisibility;
import com.planazo.review.Review;
import com.planazo.review.ReviewRepository;
import com.planazo.review.ReviewTarget;
import com.planazo.turistic_place.TuristicPlace;
import com.planazo.turistic_place.TuristicPlaceRepository;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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
    private final TuristicPlaceRepository turisticPlaceRepository;
    private final PlanRepository planRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;

    public DemoDataInitializer(
            UserRepository userRepository,
            TuristicPlaceRepository turisticPlaceRepository,
            PlanRepository planRepository,
            ReviewRepository reviewRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.demo-data.enabled:true}") boolean enabled) {
        this.userRepository = userRepository;
        this.turisticPlaceRepository = turisticPlaceRepository;
        this.planRepository = planRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seed() {
        if (!enabled) {
            log.info("Demo data seeding disabled (app.seed.demo-data.enabled=false).");
            return;
        }

        // 1) Team members — idempotent by unique email.
        List<User> team = ensureTeam();

        // 2) Guard: if the first seed member already owns plans, the baseline is
        //    present. The whole method is transactional, so this guard is reliable
        //    (partial seeds roll back and never reach this state).
        if (!planRepository.findByCreatorId(team.get(0).getId()).isEmpty()) {
            log.info("Demo baseline already present — skipping plan/place/review seeding.");
            return;
        }

        List<TuristicPlace> places = seedTuristicPlaces(team);
        List<Plan> plans = seedPlans(team);
        seedVenueReviews(team, places);
        seedUserReviews(team);

        log.info("Seeded demo baseline: {} users, {} tourist places, {} plans, {} reviews.",
                team.size(), places.size(), plans.size(), reviewRepository.count());
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

    private List<TuristicPlace> seedTuristicPlaces(List<User> team) {
        User seba = team.get(0), marcos = team.get(1), rocio = team.get(2), bryan = team.get(3), emanuel = team.get(4);

        TuristicPlace obelisco = place(seba, "Obelisco de Buenos Aires", 0.0, null, null,
                List.of(Interest.CULTURE, Interest.HISTORY), "Argentina", "Buenos Aires", "Av. 9 de Julio s/n",
                -34.6037, -58.3816,
                "The 67-metre obelisk on Avenida 9 de Julio is the city's most recognisable landmark. The plaza around it fills up after every big football win — go early if you want a clean photo.");

        TuristicPlace iguazu = place(marcos, "Cataratas del Iguazú", 35.0, 6, null,
                List.of(Interest.NATURE, Interest.ADVENTURE), "Argentina", "Puerto Iguazú", "Parque Nacional Iguazú",
                -25.6953, -54.4367,
                "A system of 275 waterfalls on the border with Brazil. The Garganta del Diablo walkway puts you right at the edge of the roar — bring a poncho, you will get soaked.");

        TuristicPlace peritoMoreno = place(marcos, "Glaciar Perito Moreno", 45.0, null, null,
                List.of(Interest.NATURE, Interest.MOUNTAINS), "Argentina", "El Calafate", "Parque Nacional Los Glaciares",
                -50.4967, -73.1377,
                "One of the few advancing glaciers in the world. From the balconies you can hear blocks of ice crack and collapse into the lake. Dress for wind even in summer.");

        TuristicPlace caminito = place(rocio, "Caminito, La Boca", 0.0, null, null,
                List.of(Interest.CULTURE, Interest.HISTORY, Interest.SHOPPING), "Argentina", "Buenos Aires", "Caminito, La Boca",
                -34.6395, -58.3625,
                "A short, colourful street museum in La Boca with tango dancers and corrugated-metal houses painted every colour imaginable. Touristy but genuinely fun in the afternoon.");

        TuristicPlace aconcagua = place(bryan, "Cerro Aconcagua", 50.0, 16, null,
                List.of(Interest.MOUNTAINS, Interest.ADVENTURE, Interest.SPORTS), "Argentina", "Mendoza", "Parque Provincial Aconcagua",
                -32.6533, -70.0109,
                "The highest peak in the Americas at 6,961 m. You don't need to summit — the entrance trails to Laguna de Horcones give you the views without the altitude permit.");

        TuristicPlace bodega = place(rocio, "Bodega en Luján de Cuyo", 28.0, 18, null,
                List.of(Interest.FOOD, Interest.CULTURE), "Argentina", "Mendoza", "Luján de Cuyo",
                -33.0386, -68.8794,
                "Classic Malbec country at the foot of the Andes. Most wineries offer a guided tour plus a three-glass tasting; book the lunch pairing if you can, it is worth the extra.");

        TuristicPlace catedral = place(bryan, "Cerro Catedral, Bariloche", 60.0, null, null,
                List.of(Interest.MOUNTAINS, Interest.SPORTS, Interest.NATURE), "Argentina", "San Carlos de Bariloche", "Cerro Catedral",
                -41.1667, -71.4333,
                "The largest ski resort in South America in winter, and a great hiking and chairlift spot the rest of the year. The view over Lago Gutiérrez from the top is the postcard everyone takes.");

        TuristicPlace humahuaca = place(emanuel, "Quebrada de Humahuaca", 10.0, null, null,
                List.of(Interest.NATURE, Interest.HISTORY, Interest.CULTURE), "Argentina", "Jujuy", "Purmamarca",
                -23.7450, -65.5000,
                "A UNESCO valley of layered, multicoloured rock. The Cerro de los Siete Colores above Purmamarca glows best in the early morning light, before the tour buses arrive.");

        TuristicPlace colon = place(rocio, "Teatro Colón", 22.0, null, null,
                List.of(Interest.CULTURE, Interest.HISTORY), "Argentina", "Buenos Aires", "Cerrito 628",
                -34.6010, -58.3835,
                "One of the world's great opera houses, with acoustics musicians rave about. The guided backstage tour is excellent even if you don't catch a performance.");

        TuristicPlace ischigualasto = place(emanuel, "Valle de la Luna (Ischigualasto)", 30.0, null, null,
                List.of(Interest.NATURE, Interest.ADVENTURE), "Argentina", "San Juan", "Parque Provincial Ischigualasto",
                -29.9000, -67.8333,
                "A desert moonscape of wind-carved rock and one of the richest dinosaur fossil sites on Earth. Go for the full-moon night tour if the dates line up — it is unforgettable.");

        return List.of(obelisco, iguazu, peritoMoreno, caminito, aconcagua,
                bodega, catedral, humahuaca, colon, ischigualasto);
    }

    private TuristicPlace place(User creator, String name, Double cost, Integer minAge, Integer maxAge,
                                List<Interest> interests, String country, String city, String address,
                                double lat, double lng, String description) {
        TuristicPlace place = new TuristicPlace(name, cost, minAge, maxAge, interests,
                country, city, address, lat, lng, List.of());
        place.setDescription(description);
        place.setCreator(creator);
        return turisticPlaceRepository.save(place);
    }

    // ---------------------------------------------------------------------
    // Plans
    // ---------------------------------------------------------------------

    private List<Plan> seedPlans(List<User> team) {
        User seba = team.get(0), marcos = team.get(1), rocio = team.get(2), bryan = team.get(3), emanuel = team.get(4);

        Plan p1 = plan(seba, "Asado y fútbol en Palermo",
                "Casual Sunday asado before the Boca match. Bring something to share — we cover the meat and the fire.",
                dt(2026, 7, 12, 13, 0), dt(2026, 7, 12, 19, 0), PlanVisibility.PUBLIC, 20, 18, null,
                List.of(Interest.FOOD, Interest.SPORTS), "Argentina", "Buenos Aires", "Parque Tres de Febrero, Palermo",
                -34.5711, -58.4173, 8000.0, List.of(marcos, bryan, emanuel));

        Plan p2 = plan(marcos, "Trekking a la Laguna de los Tres",
                "Full-day hike to the base of Mount Fitz Roy. Moderate-to-hard, ~10h round trip. Decent boots required.",
                dt(2026, 8, 9, 6, 30), dt(2026, 8, 9, 18, 0), PlanVisibility.PUBLIC, 12, 16, null,
                List.of(Interest.NATURE, Interest.MOUNTAINS, Interest.ADVENTURE), "Argentina", "El Chaltén", "Sendero Laguna de los Tres",
                -49.3300, -72.8860, 15000.0, List.of(bryan, emanuel));

        Plan p3 = plan(rocio, "Noche de ópera en el Colón",
                "We grabbed a block of seats for the season's Traviata. Smart-casual dress, dinner nearby afterwards.",
                dt(2026, 9, 3, 20, 0), dt(2026, 9, 3, 23, 30), PlanVisibility.PUBLIC, 8, 18, null,
                List.of(Interest.CULTURE, Interest.HISTORY), "Argentina", "Buenos Aires", "Teatro Colón, Cerrito 628",
                -34.6010, -58.3835, 22000.0, List.of(seba, emanuel));

        Plan p4 = plan(bryan, "Día de ski en Cerro Catedral",
                "Mid-week ski day to dodge the crowds. Carpooling from Bariloche centre at 8am. All levels welcome.",
                dt(2026, 7, 22, 8, 0), dt(2026, 7, 22, 17, 0), PlanVisibility.PUBLIC, 16, null, null,
                List.of(Interest.SPORTS, Interest.MOUNTAINS), "Argentina", "San Carlos de Bariloche", "Cerro Catedral",
                -41.1667, -71.4333, 45000.0, List.of(marcos, seba));

        Plan p5 = plan(emanuel, "Tour de bodegas en Mendoza",
                "Three wineries in Luján de Cuyo with a long lunch in the middle. We split a driver so everyone can taste.",
                dt(2026, 10, 4, 10, 0), dt(2026, 10, 4, 18, 0), PlanVisibility.PUBLIC, 10, 18, null,
                List.of(Interest.FOOD, Interest.CULTURE), "Argentina", "Mendoza", "Luján de Cuyo",
                -33.0386, -68.8794, 30000.0, List.of(seba, rocio));

        Plan p6 = plan(seba, "Recorrida foodie en San Telmo",
                "Sunday market crawl: empanadas, choripán, and the best dulce de leche stalls. Cash helps at the fair.",
                dt(2026, 7, 19, 11, 0), dt(2026, 7, 19, 16, 0), PlanVisibility.PUBLIC, 15, null, null,
                List.of(Interest.FOOD, Interest.CULTURE, Interest.SHOPPING), "Argentina", "Buenos Aires", "Feria de San Telmo, Defensa 900",
                -34.6208, -58.3735, 12000.0, List.of(rocio, emanuel, marcos));

        Plan p7 = plan(marcos, "Avistaje y caminata en Iguazú",
                "Two days at the falls: Argentine side on day one, the boat under the falls on day two. Ponchos provided.",
                dt(2026, 9, 19, 9, 0), dt(2026, 9, 20, 17, 0), PlanVisibility.PUBLIC, 14, 8, null,
                List.of(Interest.NATURE, Interest.ADVENTURE), "Argentina", "Puerto Iguazú", "Parque Nacional Iguazú",
                -25.6953, -54.4367, 38000.0, List.of(emanuel, bryan));

        Plan p8 = plan(rocio, "Tarde de tango en La Boca",
                "Caminito stroll, a milonga lesson for total beginners, and coffee with a view of the river.",
                dt(2026, 8, 16, 15, 0), dt(2026, 8, 16, 20, 0), PlanVisibility.PUBLIC, 18, null, null,
                List.of(Interest.CULTURE, Interest.HISTORY), "Argentina", "Buenos Aires", "Caminito, La Boca",
                -34.6395, -58.3625, 9000.0, List.of(seba, emanuel));

        Plan p9 = plan(bryan, "Escapada de surf a Mar del Plata",
                "Weekend of beginner surf lessons and beach volley. Boards and wetsuits rented on site.",
                dt(2026, 11, 7, 9, 0), dt(2026, 11, 8, 18, 0), PlanVisibility.PUBLIC, 12, 16, 45,
                List.of(Interest.BEACH, Interest.SPORTS, Interest.ADVENTURE), "Argentina", "Mar del Plata", "Playa Grande",
                -38.0500, -57.5300, 26000.0, List.of(seba, marcos));

        Plan p10 = plan(emanuel, "Amanecer en Purmamarca",
                "Early start to catch the Cerro de los Siete Colores at sunrise, then a slow breakfast in the village.",
                dt(2026, 10, 25, 6, 0), dt(2026, 10, 25, 11, 0), PlanVisibility.PRIVATE, 8, null, null,
                List.of(Interest.NATURE, Interest.HISTORY), "Argentina", "Purmamarca", "Cerro de los Siete Colores",
                -23.7450, -65.5000, 7000.0, List.of(marcos, rocio));

        return List.of(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10);
    }

    private Plan plan(User creator, String title, String description,
                      LocalDateTime start, LocalDateTime end, PlanVisibility visibility,
                      Integer maxSubscribers, Integer minAge, Integer maxAge,
                      List<Interest> interests, String country, String city, String address,
                      double lat, double lng, double budget, List<User> members) {
        Plan plan = new Plan(title, description, start, end, visibility, maxSubscribers, minAge, maxAge,
                interests, country, city, address, lat, lng, List.of(), creator, AR_TZ);
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

    private void seedVenueReviews(List<User> team, List<TuristicPlace> places) {
        User seba = team.get(0), marcos = team.get(1), rocio = team.get(2), bryan = team.get(3), emanuel = team.get(4);
        TuristicPlace obelisco = places.get(0), iguazu = places.get(1), peritoMoreno = places.get(2),
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

    private void venueReview(User author, TuristicPlace place, int rating, String comment) {
        reviewRepository.save(new Review(author, rating, comment, ReviewTarget.VENUE, place.getId()));
    }

    private void userReview(User author, User target, int rating, String comment) {
        reviewRepository.save(new Review(author, rating, comment, ReviewTarget.USER, target.getId()));
    }

    private static LocalDateTime dt(int year, int month, int day, int hour, int minute) {
        return LocalDateTime.of(year, month, day, hour, minute);
    }
}
