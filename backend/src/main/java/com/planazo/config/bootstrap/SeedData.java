package com.planazo.config.bootstrap;

import com.planazo.common.constants.Interest;
import com.planazo.common.constants.TravelType;
import com.planazo.tourist_place.OpeningHours;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import static java.time.DayOfWeek.FRIDAY;
import static java.time.DayOfWeek.MONDAY;
import static java.time.DayOfWeek.SATURDAY;
import static java.time.DayOfWeek.SUNDAY;
import static java.time.DayOfWeek.THURSDAY;
import static java.time.DayOfWeek.TUESDAY;
import static java.time.DayOfWeek.WEDNESDAY;

/**
 * Static, reusable catalogs and text generators for the demo-data expansion.
 *
 * <p>Pure data + pure functions (no Spring / persistence). The orchestration and
 * persistence live in {@link DemoDataInitializer}. Keeping this separate makes the
 * dataset easy to read, audit and extend without touching the seeding logic.
 */
final class SeedData {

    private SeedData() {}

    // =====================================================================
    // Records
    // =====================================================================

    record PersonaSpec(
            String email,
            String firstName,
            String lastName,
            String gender,
            LocalDate birthDate,
            List<Interest> interests,
            TravelType travelType,
            List<String> languages,
            String personality) {}

    record PlaceSpec(
            String name,
            String country,
            String state,
            String city,
            String address,
            double lat,
            double lng,
            double cost,
            List<Interest> interests,
            String description,
            List<String> images) {}

    // =====================================================================
    // 35 new users — diverse names, origins, interests and personalities.
    // (The User model has no profession/nationality/bio fields, so that
    //  diversity is reflected via names, languages, interests, travel type
    //  and the review "personality" that drives each author's voice/ratings.)
    // =====================================================================

    static final List<PersonaSpec> PERSONAS = buildPersonas();

    private static List<PersonaSpec> buildPersonas() {
        List<PersonaSpec> l = new ArrayList<>();
        l.add(new PersonaSpec("valentina.rossi@planazo.dev", "Valentina", "Rossi", "female", LocalDate.of(1995, 4, 12), List.of(Interest.CULTURE, Interest.FOOD), TravelType.COUPLE, List.of("Spanish", "Italian", "English"), "detallista"));
        l.add(new PersonaSpec("mateo.silva@planazo.dev", "Mateo", "Silva", "male", LocalDate.of(1990, 8, 3), List.of(Interest.BEACH, Interest.NIGHTLIFE), TravelType.FRIENDS, List.of("Portuguese", "Spanish"), "sociable"));
        l.add(new PersonaSpec("camila.torres@planazo.dev", "Camila", "Torres", "female", LocalDate.of(1998, 1, 27), List.of(Interest.NATURE, Interest.ADVENTURE), TravelType.SOLO, List.of("Spanish", "English"), "aventurero"));
        l.add(new PersonaSpec("joaquin.mendez@planazo.dev", "Joaquín", "Méndez", "male", LocalDate.of(1986, 11, 9), List.of(Interest.HISTORY, Interest.CULTURE), TravelType.COUPLE, List.of("Spanish"), "profesional"));
        l.add(new PersonaSpec("isabella.romano@planazo.dev", "Isabella", "Romano", "female", LocalDate.of(2001, 6, 18), List.of(Interest.SHOPPING, Interest.FOOD), TravelType.FRIENDS, List.of("Italian", "English"), "entusiasta"));
        l.add(new PersonaSpec("thiago.pereira@planazo.dev", "Thiago", "Pereira", "male", LocalDate.of(1993, 3, 22), List.of(Interest.SPORTS, Interest.BEACH), TravelType.FRIENDS, List.of("Portuguese", "English"), "practico"));
        l.add(new PersonaSpec("martina.lopez@planazo.dev", "Martina", "López", "female", LocalDate.of(1999, 9, 5), List.of(Interest.NATURE, Interest.MOUNTAINS), TravelType.SOLO, List.of("Spanish", "English"), "reservado"));
        l.add(new PersonaSpec("benjamin.castro@planazo.dev", "Benjamín", "Castro", "male", LocalDate.of(1988, 7, 14), List.of(Interest.FOOD, Interest.CULTURE), TravelType.COUPLE, List.of("Spanish", "English"), "exigente"));
        l.add(new PersonaSpec("olivia.brown@planazo.dev", "Olivia", "Brown", "female", LocalDate.of(1992, 12, 1), List.of(Interest.CULTURE, Interest.HISTORY), TravelType.SOLO, List.of("English", "Spanish"), "detallista"));
        l.add(new PersonaSpec("lucas.muller@planazo.dev", "Lucas", "Müller", "male", LocalDate.of(1996, 2, 16), List.of(Interest.MOUNTAINS, Interest.ADVENTURE), TravelType.FRIENDS, List.of("German", "English"), "practico"));
        l.add(new PersonaSpec("sofia.navarro@planazo.dev", "Sofía", "Navarro", "female", LocalDate.of(1994, 5, 30), List.of(Interest.FOOD, Interest.NIGHTLIFE), TravelType.FRIENDS, List.of("Spanish", "English"), "sociable"));
        l.add(new PersonaSpec("nicolas.ferreyra@planazo.dev", "Nicolás", "Ferreyra", "male", LocalDate.of(1991, 10, 8), List.of(Interest.SPORTS, Interest.NATURE), TravelType.SOLO, List.of("Spanish"), "critico"));
        l.add(new PersonaSpec("emma.dubois@planazo.dev", "Emma", "Dubois", "female", LocalDate.of(1997, 7, 19), List.of(Interest.CULTURE, Interest.SHOPPING), TravelType.COUPLE, List.of("French", "English"), "amable"));
        l.add(new PersonaSpec("santiago.gomez@planazo.dev", "Santiago", "Gómez", "male", LocalDate.of(1989, 4, 2), List.of(Interest.HISTORY, Interest.ADVENTURE), TravelType.FRIENDS, List.of("Spanish", "English"), "entusiasta"));
        l.add(new PersonaSpec("chloe.martin@planazo.dev", "Chloé", "Martin", "female", LocalDate.of(2000, 3, 11), List.of(Interest.NATURE, Interest.BEACH), TravelType.SOLO, List.of("French", "Spanish", "English"), "aventurero"));
        l.add(new PersonaSpec("diego.vargas@planazo.dev", "Diego", "Vargas", "male", LocalDate.of(1985, 6, 25), List.of(Interest.FOOD, Interest.HISTORY), TravelType.COUPLE, List.of("Spanish", "English"), "profesional"));
        l.add(new PersonaSpec("julia.fischer@planazo.dev", "Julia", "Fischer", "female", LocalDate.of(2002, 8, 29), List.of(Interest.SHOPPING, Interest.NIGHTLIFE), TravelType.FRIENDS, List.of("German", "English"), "entusiasta"));
        l.add(new PersonaSpec("tomas.rodriguez@planazo.dev", "Tomás", "Rodríguez", "male", LocalDate.of(1992, 1, 7), List.of(Interest.SPORTS, Interest.BEACH), TravelType.FRIENDS, List.of("Spanish"), "practico"));
        l.add(new PersonaSpec("ava.wilson@planazo.dev", "Ava", "Wilson", "female", LocalDate.of(1995, 11, 23), List.of(Interest.CULTURE, Interest.NATURE), TravelType.SOLO, List.of("English"), "reservado"));
        l.add(new PersonaSpec("facundo.sosa@planazo.dev", "Facundo", "Sosa", "male", LocalDate.of(1998, 2, 4), List.of(Interest.NIGHTLIFE, Interest.SPORTS), TravelType.FRIENDS, List.of("Spanish", "English"), "sociable"));
        l.add(new PersonaSpec("renata.costa@planazo.dev", "Renata", "Costa", "female", LocalDate.of(1990, 9, 16), List.of(Interest.FOOD, Interest.BEACH), TravelType.COUPLE, List.of("Portuguese", "Spanish"), "amable"));
        l.add(new PersonaSpec("ivan.petrov@planazo.dev", "Iván", "Petrov", "male", LocalDate.of(1987, 12, 12), List.of(Interest.MOUNTAINS, Interest.HISTORY), TravelType.SOLO, List.of("Russian", "English"), "exigente"));
        l.add(new PersonaSpec("mia.sanchez@planazo.dev", "Mía", "Sánchez", "female", LocalDate.of(2001, 5, 8), List.of(Interest.SHOPPING, Interest.CULTURE), TravelType.FRIENDS, List.of("Spanish", "English"), "entusiasta"));
        l.add(new PersonaSpec("gonzalo.diaz@planazo.dev", "Gonzalo", "Díaz", "male", LocalDate.of(1984, 3, 19), List.of(Interest.NATURE, Interest.ADVENTURE), TravelType.COUPLE, List.of("Spanish"), "critico"));
        l.add(new PersonaSpec("hana.kim@planazo.dev", "Hana", "Kim", "female", LocalDate.of(1996, 7, 1), List.of(Interest.FOOD, Interest.CULTURE), TravelType.SOLO, List.of("Korean", "English"), "detallista"));
        l.add(new PersonaSpec("pedro.almeida@planazo.dev", "Pedro", "Almeida", "male", LocalDate.of(1993, 10, 27), List.of(Interest.HISTORY, Interest.BEACH), TravelType.FRIENDS, List.of("Portuguese", "English"), "practico"));
        l.add(new PersonaSpec("lucia.moretti@planazo.dev", "Lucía", "Moretti", "female", LocalDate.of(1999, 4, 14), List.of(Interest.CULTURE, Interest.SHOPPING), TravelType.COUPLE, List.of("Italian", "Spanish"), "amable"));
        l.add(new PersonaSpec("andres.herrera@planazo.dev", "Andrés", "Herrera", "male", LocalDate.of(1990, 6, 6), List.of(Interest.SPORTS, Interest.MOUNTAINS), TravelType.FRIENDS, List.of("Spanish", "English"), "aventurero"));
        l.add(new PersonaSpec("freya.andersen@planazo.dev", "Freya", "Andersen", "female", LocalDate.of(1994, 1, 21), List.of(Interest.NATURE, Interest.HISTORY), TravelType.SOLO, List.of("Danish", "English"), "reservado"));
        l.add(new PersonaSpec("bruno.ricci@planazo.dev", "Bruno", "Ricci", "male", LocalDate.of(1988, 8, 17), List.of(Interest.FOOD, Interest.NIGHTLIFE), TravelType.FRIENDS, List.of("Italian", "English"), "sociable"));
        l.add(new PersonaSpec("paula.giordano@planazo.dev", "Paula", "Giordano", "female", LocalDate.of(1997, 11, 3), List.of(Interest.BEACH, Interest.SPORTS), TravelType.SOLO, List.of("Spanish", "English"), "entusiasta"));
        l.add(new PersonaSpec("kenji.tanaka@planazo.dev", "Kenji", "Tanaka", "male", LocalDate.of(1991, 5, 24), List.of(Interest.CULTURE, Interest.MOUNTAINS), TravelType.SOLO, List.of("Japanese", "English"), "profesional"));
        l.add(new PersonaSpec("florencia.ramos@planazo.dev", "Florencia", "Ramos", "female", LocalDate.of(2000, 2, 9), List.of(Interest.FOOD, Interest.NATURE), TravelType.FRIENDS, List.of("Spanish", "English"), "amable"));
        l.add(new PersonaSpec("liam.oconnor@planazo.dev", "Liam", "O'Connor", "male", LocalDate.of(1995, 9, 28), List.of(Interest.HISTORY, Interest.NIGHTLIFE), TravelType.FRIENDS, List.of("English"), "critico"));
        l.add(new PersonaSpec("antonella.bruno@planazo.dev", "Antonella", "Bruno", "female", LocalDate.of(1992, 12, 19), List.of(Interest.CULTURE, Interest.ADVENTURE), TravelType.COUPLE, List.of("Spanish", "Italian"), "detallista"));
        return l;
    }

    // =====================================================================
    // 90 new tourist places.
    // Distribution (combined with the 10 all-Argentina base places, which are
    // 3 CABA + 7 provinces, yields the required global 60% AR / 40% world, and
    // within AR 60% CABA / 40% provinces):
    //   - 33 CABA  + 17 AR provinces (= 50 AR)  + 40 rest of the world.
    // =====================================================================

    static final List<PlaceSpec> PLACES = buildPlaces();

    private static PlaceSpec p(String name, String city, String state, String country,
                          double lat, double lng, double cost,
                          List<Interest> interests, String description, List<String> images) {
        return new PlaceSpec(name, country, state, city, null, lat, lng, cost, interests, description, images);
    }

    private static List<PlaceSpec> buildPlaces() {
        List<PlaceSpec> l = new ArrayList<>();

        // --- CABA (33) ---
        l.add(p("MALBA", "Buenos Aires", "CABA", "Argentina", -34.5777, -58.4033, 12.0, List.of(Interest.CULTURE), "Modern Latin American art in a bright Palermo building.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400088/MALBA_wm2wdz.jpg")));
        l.add(p("Cementerio de la Recoleta", "Buenos Aires", "CABA", "Argentina", -34.5875, -58.3936, 0.0, List.of(Interest.HISTORY), "Ornate mausoleums and the resting place of Eva Perón.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400126/cementerio-recoleta-drone-1500x610-nn_kbgxr4.jpg")));
        l.add(p("Bosques de Palermo", "Buenos Aires", "CABA", "Argentina", -34.5710, -58.4170, 0.0, List.of(Interest.NATURE), "Lakes, rose garden and pedal boats in the city's green lung.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400190/puente-griego-bosques-palermo1500x610_qr3wqh.jpg")));
        l.add(p("Puerto Madero", "Buenos Aires", "CABA", "Argentina", -34.6110, -58.3630, 0.0, List.of(Interest.CULTURE), "Reclaimed docklands with the Puente de la Mujer and riverside walks.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400227/puertomadero_wdkwo9.jpg")));
        l.add(p("Floralis Genérica", "Buenos Aires", "CABA", "Argentina", -34.5829, -58.3925, 0.0, List.of(Interest.CULTURE), "Giant steel flower that opens and closes with the sun.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400261/floris_txrbyg.jpg")));
        l.add(p("Planetario Galileo Galilei", "Buenos Aires", "CABA", "Argentina", -34.5694, -58.4114, 8.0, List.of(Interest.CULTURE), "Dome shows about the southern skies in a striking modernist building.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400314/planetario_pg68uz.jpg")));
        l.add(p("Jardín Japonés", "Buenos Aires", "CABA", "Argentina", -34.5760, -58.4110, 6.0, List.of(Interest.NATURE), "Koi ponds, bonsai and a teahouse in a serene corner of Palermo.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400342/jj_chtqim.jpg")));
        l.add(p("Plaza de Mayo", "Buenos Aires", "CABA", "Argentina", -34.6083, -58.3722, 0.0, List.of(Interest.HISTORY), "The political heart of the country, ringed by historic buildings.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400382/pdemayo_bm3aoa.jpg")));
        l.add(p("Casa Rosada", "Buenos Aires", "CABA", "Argentina", -34.6080, -58.3702, 0.0, List.of(Interest.HISTORY), "The pink presidential palace with its famous balcony.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400420/casarosada_zchsbw.jpg")));
        l.add(p("El Ateneo Grand Splendid", "Buenos Aires", "CABA", "Argentina", -34.5959, -58.3937, 0.0, List.of(Interest.SHOPPING, Interest.CULTURE), "A bookshop inside a century-old theatre, often called the world's most beautiful.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400463/ateneo_w6c9cy.jpg")));
        l.add(p("Mercado de San Telmo", "Buenos Aires", "CABA", "Argentina", -34.6206, -58.3716, 0.0, List.of(Interest.SHOPPING, Interest.FOOD), "Antiques, produce and empanadas under a wrought-iron roof.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400638/santelmo_h5qy62.jpg")));
        l.add(p("Usina del Arte", "Buenos Aires", "CABA", "Argentina", -34.6286, -58.3568, 0.0, List.of(Interest.CULTURE), "A former power plant turned concert hall in La Boca.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400683/usina_k4l4uz.jpg")));
        l.add(p("Reserva Ecológica Costanera Sur", "Buenos Aires", "CABA", "Argentina", -34.6120, -58.3500, 0.0, List.of(Interest.NATURE), "Birdwatching and river views on trails beside Puerto Madero.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400728/reserva_p3swut.jpg")));
        l.add(p("Centro Cultural Kirchner", "Buenos Aires", "CABA", "Argentina", -34.6075, -58.3702, 0.0, List.of(Interest.CULTURE), "Huge cultural centre with free concerts in the old post office.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400763/nestor_ddwh8v.jpg")));
        l.add(p("Estadio Monumental", "Buenos Aires", "CABA", "Argentina", -34.5453, -58.4498, 20.0, List.of(Interest.SPORTS), "Home of River Plate and the national team, with a stadium museum.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400801/monumwntal_c3xm1u.jpg")));
        l.add(p("La Bombonera", "Buenos Aires", "CABA", "Argentina", -34.6356, -58.3647, 18.0, List.of(Interest.SPORTS), "Boca Juniors' steep, deafening stadium in La Boca.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400836/bomb_sezlhe.jpg")));
        l.add(p("Barrio Chino de Belgrano", "Buenos Aires", "CABA", "Argentina", -34.5610, -58.4540, 0.0, List.of(Interest.FOOD), "A compact, lively Chinatown for dumplings and bubble tea.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400886/Barrio_Chino__Buenos_Aires._Septiembre_2015.__4_xixqaf.jpg")));
        l.add(p("Galerías Pacífico", "Buenos Aires", "CABA", "Argentina", -34.6010, -58.3750, 0.0, List.of(Interest.SHOPPING), "Frescoed shopping arcade on pedestrian Calle Florida.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400920/162613852660ece79e2d3f460ece79e2d3f8_fyqj4x.jpg")));
        l.add(p("Avenida Corrientes", "Buenos Aires", "CABA", "Argentina", -34.6038, -58.3850, 0.0, List.of(Interest.CULTURE), "The never-sleeping theatre, bookshop and pizza strip.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782400960/av_xveeio.jpg")));
        l.add(p("Congreso de la Nación", "Buenos Aires", "CABA", "Argentina", -34.6097, -58.3925, 0.0, List.of(Interest.HISTORY), "The grand domed parliament building and its plaza.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782401000/Congreso_Nacional_Buenos_Aires_cfezs9.jpg")));
        l.add(p("Café Tortoni", "Buenos Aires", "CABA", "Argentina", -34.6086, -58.3780, 0.0, List.of(Interest.FOOD), "The city's oldest café, all marble, mirrors and tango.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782401042/Caf%C3%A9_Tortoni_ycg90g.jpg")));
        l.add(p("Palermo Soho", "Buenos Aires", "CABA", "Argentina", -34.5880, -58.4250, 0.0, List.of(Interest.NIGHTLIFE), "Cobbled streets packed with bars, design shops and street art.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782401083/soho_z6i4lr.jpg")));
        l.add(p("Feria de Mataderos", "Buenos Aires", "CABA", "Argentina", -34.6580, -58.5050, 0.0, List.of(Interest.CULTURE), "Folk music, gaucho skills and regional food on weekends.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782401126/feria_qpqpfn.jpg")));
        l.add(p("Jardín Botánico Carlos Thays", "Buenos Aires", "CABA", "Argentina", -34.5817, -58.4170, 0.0, List.of(Interest.NATURE), "Greenhouses and shaded paths in the middle of Palermo.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782401622/jardin-botanico_sltzam.jpg")));
        l.add(p("Museo Nacional de Bellas Artes", "Buenos Aires", "CABA", "Argentina", -34.5840, -58.3930, 0.0, List.of(Interest.CULTURE), "Free national gallery with European masters and Argentine art.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782401667/Fachada-MNBA-Soledad-Obeid-scaled_tbwbwc.jpg")));
        l.add(p("Mercado de Abasto", "Buenos Aires", "CABA", "Argentina", -34.6037, -58.4106, 0.0, List.of(Interest.SHOPPING), "A landmark Art Deco market turned shopping mall.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782401738/abasto_kqm91c.jpg")));
        l.add(p("Parque Centenario", "Buenos Aires", "CABA", "Argentina", -34.6066, -58.4350, 0.0, List.of(Interest.NATURE), "A circular park with a weekend craft and book fair.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782401774/cent_ousv4a.jpg")));
        l.add(p("Luna Park", "Buenos Aires", "CABA", "Argentina", -34.6020, -58.3690, 25.0, List.of(Interest.NIGHTLIFE), "The historic downtown arena for boxing and big concerts.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782401810/luna_jfflxh.jpg")));
        l.add(p("Plaza Dorrego", "Buenos Aires", "CABA", "Argentina", -34.6205, -58.3712, 0.0, List.of(Interest.CULTURE), "San Telmo's antiques square with Sunday street tango.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782401851/dorrego_krzqwi.jpg")));
        l.add(p("Barrancas de Belgrano", "Buenos Aires", "CABA", "Argentina", -34.5610, -58.4560, 0.0, List.of(Interest.NATURE), "A leafy park with weekend milongas under the trees.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782401887/barrancas-de-belgrano_wsowpl.jpg")));
        l.add(p("Calle Florida", "Buenos Aires", "CABA", "Argentina", -34.6000, -58.3750, 0.0, List.of(Interest.SHOPPING), "The busy downtown pedestrian shopping street.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782401923/florida_rfi69r.jpg")));
        l.add(p("Distrito Arcos", "Buenos Aires", "CABA", "Argentina", -34.5760, -58.4290, 0.0, List.of(Interest.SHOPPING), "Open-air outlet mall under restored railway arches.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782401945/distrito-arcos_bxfhrx.jpg")));
        l.add(p("Ciudad Cultural Konex", "Buenos Aires", "CABA", "Argentina", -34.6040, -58.4110, 15.0, List.of(Interest.NIGHTLIFE), "Industrial venue famous for its Monday-night drum show.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782401990/konex_y3mgdd.jpg")));

        // --- Argentine provinces (17) ---
        l.add(p("Quebrada de Cafayate", "Cafayate", "Salta", "Argentina", -26.0731, -65.9786, 0.0, List.of(Interest.NATURE), "Wind-sculpted red canyons on the road through Salta's wine country.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782402030/cyafate_bche5b.jpg")));
        l.add(p("Salinas Grandes", "Jujuy", "Jujuy", "Argentina", -23.6260, -66.0960, 10.0, List.of(Interest.NATURE), "A blinding white salt flat high on the Andean plateau.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782402068/salinas_illuqq.jpg")));
        l.add(p("Cerro de los Siete Colores", "Purmamarca", "Jujuy", "Argentina", -23.7450, -65.5000, 0.0, List.of(Interest.NATURE, Interest.HISTORY), "The seven-coloured hill glowing above an adobe village.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782402101/caption_mjy3zz.jpg")));
        l.add(p("Villa Carlos Paz", "Córdoba", "Córdoba", "Argentina", -31.4241, -64.4978, 0.0, List.of(Interest.NIGHTLIFE), "A lakeside resort town buzzing in the summer season.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782402141/carlopas_vclplp.jpg")));
        l.add(p("La Cumbrecita", "Córdoba", "Córdoba", "Argentina", -31.9000, -64.7800, 0.0, List.of(Interest.NATURE, Interest.MOUNTAINS), "A car-free Alpine-style village in the Sierras.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782402176/se-encuentra-ubicado-en-el-valle-de-calamuchita-5K3FBSAJYNCY5G72HTEANVWFVI_oxv8hw.jpg")));
        l.add(p("Tren del Fin del Mundo", "Ushuaia", "Tierra del Fuego", "Argentina", -54.8019, -68.3030, 40.0, List.of(Interest.ADVENTURE), "A steam train into the forests of the world's southernmost city.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782402221/tren_qrg9ce.jpg")));
        l.add(p("Parque Nacional Tierra del Fuego", "Ushuaia", "Tierra del Fuego", "Argentina", -54.8500, -68.5500, 25.0, List.of(Interest.NATURE), "Peat bogs, lakes and coastal trails at the end of the continent.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782402260/parque_aos2mk.jpg")));
        l.add(p("Península Valdés", "Puerto Madryn", "Chubut", "Argentina", -42.5000, -63.9500, 30.0, List.of(Interest.NATURE), "Whales, sea lions and penguins on a wild Atlantic peninsula.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782402296/peninsula_sv8syn.jpg")));
        l.add(p("Puerto Madryn Costanera", "Puerto Madryn", "Chubut", "Argentina", -42.7692, -65.0385, 0.0, List.of(Interest.BEACH), "A breezy seaside promenade and gateway to marine life.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782402355/costas-de-patagonia_h9yaec.jpg")));
        l.add(p("Circuito Chico", "San Carlos de Bariloche", "Río Negro", "Argentina", -41.1000, -71.5000, 0.0, List.of(Interest.NATURE, Interest.MOUNTAINS), "A scenic loop of lakes and viewpoints around Bariloche.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782402385/circ_j39v77.jpg")));
        l.add(p("Villa La Angostura", "Neuquén", "Neuquén", "Argentina", -40.7641, -71.6420, 0.0, List.of(Interest.NATURE), "A lakeside woodland town on the Route of the Seven Lakes.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782402428/villalang_jvlcdl.jpg")));
        l.add(p("San Martín de los Andes", "Neuquén", "Neuquén", "Argentina", -40.1579, -71.3525, 0.0, List.of(Interest.MOUNTAINS, Interest.NATURE), "A charming mountain town at the foot of Lácar lake.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782402501/sanaetin_ejnn64.jpg")));
        l.add(p("Termas de Río Hondo", "Santiago del Estero", "Santiago del Estero", "Argentina", -27.4936, -64.8580, 0.0, List.of(Interest.OTHER), "A spa town built around its thermal mineral waters.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782402532/2_santiago_del_estero_termas_de_rio_hondo2-lrn_web_grloav.jpg")));
        l.add(p("Monumento a la Bandera", "Rosario", "Santa Fe", "Argentina", -32.9468, -60.6303, 0.0, List.of(Interest.HISTORY), "A monumental tribute to the Argentine flag beside the Paraná.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782406968/monumento-a-la-bandera_ricuan.jpg")));
        l.add(p("Torreón del Monje", "Mar del Plata", "Buenos Aires", "Argentina", -38.0230, -57.5290, 0.0, List.of(Interest.BEACH), "A clifftop landmark over Mar del Plata's beaches.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407018/y2HTwOAM_1200x0__1_ko2ily.jpg")));
        l.add(p("El Chaltén", "El Chaltén", "Santa Cruz", "Argentina", -49.3300, -72.8860, 0.0, List.of(Interest.MOUNTAINS, Interest.ADVENTURE), "Argentina's trekking capital beneath the Fitz Roy massif.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407070/chantel_osb8on.jpg")));
        l.add(p("Dique Cabra Corral", "Salta", "Salta", "Argentina", -25.2700, -65.3300, 0.0, List.of(Interest.ADVENTURE, Interest.NATURE), "A vast reservoir for kayaking, sailing and bungee jumps.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407131/d_cv0cod.jpg")));

        // --- Rest of the world (40) ---
        l.add(p("Cristo Redentor", "Rio de Janeiro", "Rio de Janeiro", "Brazil", -22.9519, -43.2105, 25.0, List.of(Interest.CULTURE), "The arms-open statue watching over Rio from Corcovado.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407173/cristo_pnthvz.jpg")));
        l.add(p("Pão de Açúcar", "Rio de Janeiro", "Rio de Janeiro", "Brazil", -22.9486, -43.1566, 30.0, List.of(Interest.NATURE), "Cable cars to Sugarloaf for sweeping bay views.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407238/vista-do-morro-da-urca_b58rqe.jpg")));
        l.add(p("Machu Picchu", "Cusco", "Cusco", "Peru", -13.1631, -72.5450, 50.0, List.of(Interest.HISTORY), "The cloud-wrapped Inca citadel high in the Andes.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407241/machu_ztkc4y.jpg")));
        l.add(p("Torres del Paine", "Puerto Natales", "Magallanes", "Chile", -51.0000, -73.0000, 35.0, List.of(Interest.MOUNTAINS, Interest.NATURE), "Granite spires, glaciers and turquoise lakes in Patagonia.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407327/paine_nwpkyx.jpg")));
        l.add(p("Desierto de Atacama", "San Pedro de Atacama", "Antofagasta", "Chile", -23.8500, -69.2300, 0.0, List.of(Interest.NATURE, Interest.ADVENTURE), "The driest desert on Earth, with geysers and salt lagoons.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407374/atacama_x24myj.jpg")));
        l.add(p("Rambla de Montevideo", "Montevideo", "Montevideo", "Uruguay", -34.9000, -56.1600, 0.0, List.of(Interest.BEACH), "A long riverside promenade made for sunset strolls and mate.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407437/rambla_wf3bny.jpg")));
        l.add(p("Punta del Este", "Punta del Este", "Maldonado", "Uruguay", -34.9500, -54.9500, 0.0, List.of(Interest.BEACH, Interest.NIGHTLIFE), "Beaches by day and a lively scene by night.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407439/4c919a_e4c8b4bf204a488a9eb1a7b6bd173c0e_mv2_zw94yt.jpg")));
        l.add(p("Cartagena Old Town", "Cartagena", "Bolívar", "Colombia", 10.4236, -75.5518, 0.0, List.of(Interest.CULTURE, Interest.HISTORY), "Walled colonial streets in colour on the Caribbean coast.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407487/oldtown_i08ulj.jpg")));
        l.add(p("Salar de Uyuni", "Uyuni", "Potosí", "Bolivia", -20.1338, -67.4891, 20.0, List.of(Interest.NATURE), "The world's largest salt flat, a mirror after the rains.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407527/sala_r_ksnskr.jpg")));
        l.add(p("Chichén Itzá", "Yucatán", "Yucatán", "Mexico", 20.6843, -88.5678, 30.0, List.of(Interest.HISTORY), "The great Maya pyramid of El Castillo.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407581/chiche_b2tgxv.jpg")));
        l.add(p("Playas de Cancún", "Cancún", "Quintana Roo", "Mexico", 21.1619, -86.8515, 0.0, List.of(Interest.BEACH), "Turquoise Caribbean water and white sand.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407625/cancun_mxf8tr.jpg")));
        l.add(p("Times Square", "New York", "New York", "United States", 40.7580, -73.9855, 0.0, List.of(Interest.NIGHTLIFE), "The blazing crossroads of Manhattan's theatre district.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407657/times_f0tgou.jpg")));
        l.add(p("Golden Gate Bridge", "San Francisco", "California", "United States", 37.8199, -122.4783, 0.0, List.of(Interest.CULTURE), "The iconic red suspension bridge over the bay.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407697/brodge_mja0dy.jpg")));
        l.add(p("Grand Canyon", "Arizona", "Arizona", "United States", 36.1069, -112.1129, 35.0, List.of(Interest.NATURE), "A mile-deep gorge carved by the Colorado River.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407769/Canyon_River_Tree__165872763_snfptq.jpg")));
        l.add(p("Niagara Falls", "Ontario", "Ontario", "Canada", 43.0962, -79.0377, 0.0, List.of(Interest.NATURE), "Thundering falls you can ride a boat right beneath.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407811/nia_geifqw.jpg")));
        l.add(p("Banff National Park", "Alberta", "Alberta", "Canada", 51.4968, -115.9281, 0.0, List.of(Interest.MOUNTAINS, Interest.NATURE), "Glacier-fed turquoise lakes ringed by the Rockies.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407852/banff_iy6drx.jpg")));
        l.add(p("Tour Eiffel", "Paris", "Île-de-France", "France", 48.8584, 2.2945, 28.0, List.of(Interest.CULTURE), "The wrought-iron symbol of Paris above the Champ de Mars.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407889/iffel_mke7vi.jpg")));
        l.add(p("Musée du Louvre", "Paris", "Île-de-France", "France", 48.8606, 2.3376, 22.0, List.of(Interest.CULTURE, Interest.HISTORY), "The world's most visited museum, home to the Mona Lisa.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407889/iffel_mke7vi.jpg")));
        l.add(p("Colosseo", "Rome", "Lazio", "Italy", 41.8902, 12.4922, 18.0, List.of(Interest.HISTORY), "The vast amphitheatre at the centre of ancient Rome.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407931/musee_ou6rha.jpg")));
        l.add(p("Canales de Venecia", "Venice", "Veneto", "Italy", 45.4408, 12.3155, 0.0, List.of(Interest.CULTURE), "A maze of canals, bridges and gondolas.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782407977/veneceia_eclujh.jpg")));
        l.add(p("Sagrada Família", "Barcelona", "Cataluña", "Spain", 41.4036, 2.1744, 26.0, List.of(Interest.CULTURE), "Gaudí's still-unfinished basilica of soaring stone.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408044/sagrafa_lftaim.jpg")));
        l.add(p("Park Güell", "Barcelona", "Cataluña", "Spain", 41.4145, 2.1527, 10.0, List.of(Interest.CULTURE, Interest.NATURE), "Gaudí's mosaic terraces overlooking the city.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408079/park_hykfm2.jpg")));
        l.add(p("Puerta del Sol", "Madrid", "Comunidad de Madrid", "Spain", 40.4168, -3.7038, 0.0, List.of(Interest.CULTURE), "Madrid's lively central square and kilometre zero.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408129/puerta_c1xvjo.jpg")));
        l.add(p("Big Ben & Westminster", "London", "England", "United Kingdom", 51.5007, -0.1246, 0.0, List.of(Interest.HISTORY), "The clock tower beside the Houses of Parliament.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408166/bigben_imjelc.jpg")));
        l.add(p("Tower Bridge", "London", "England", "United Kingdom", 51.5055, -0.0754, 0.0, List.of(Interest.HISTORY), "The Victorian bascule bridge over the Thames.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408202/tpwer_rongjt.jpg")));
        l.add(p("Brandenburger Tor", "Berlin", "Berlin", "Germany", 52.5163, 13.3777, 0.0, List.of(Interest.HISTORY), "The neoclassical gate at the heart of Berlin.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408244/branifwitor_ydaf3s.jpg")));
        l.add(p("Casa de Ana Frank", "Amsterdam", "North Holland", "Netherlands", 52.3752, 4.8840, 16.0, List.of(Interest.HISTORY), "The canal house where Anne Frank wrote her diary.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408287/ana_u7uikk.jpg")));
        l.add(p("Santorini", "Santorini", "South Aegean", "Greece", 36.3932, 25.4615, 0.0, List.of(Interest.BEACH), "Whitewashed cliffs and blue domes over the Aegean.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408317/uy2qidhrbntj85537glz_wyj84c.jpg")));
        l.add(p("Acrópolis de Atenas", "Athens", "Attica", "Greece", 37.9715, 23.7257, 20.0, List.of(Interest.HISTORY), "The Parthenon crowning the ancient citadel.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408365/atenas_gd4rbi.jpg")));
        l.add(p("Pirámides de Giza", "Giza", "Giza", "Egypt", 29.9792, 31.1342, 22.0, List.of(Interest.HISTORY), "The last standing wonder of the ancient world.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408400/giza_egqhou.jpg")));
        l.add(p("Burj Khalifa", "Dubai", "Dubai", "United Arab Emirates", 25.1972, 55.2744, 40.0, List.of(Interest.SHOPPING, Interest.CULTURE), "The world's tallest tower above a glittering city.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408430/Burj_Khalifa_kgacfz.jpg")));
        l.add(p("Taj Mahal", "Agra", "Uttar Pradesh", "India", 27.1751, 78.0421, 18.0, List.of(Interest.HISTORY), "The marble mausoleum shimmering at dawn.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408469/taj_ivwtdc.jpg")));
        l.add(p("Gran Muralla China", "Beijing", "Beijing", "China", 40.4319, 116.5704, 25.0, List.of(Interest.HISTORY), "Ramparts winding for miles over green ridges.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408501/china2_1787x2000_netqsr.jpg")));
        l.add(p("Cruce de Shibuya", "Tokyo", "Tokyo", "Japan", 35.6595, 139.7005, 0.0, List.of(Interest.NIGHTLIFE), "The world's busiest pedestrian scramble in neon Tokyo.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408552/shiba_qgwg6u.jpg")));
        l.add(p("Monte Fuji", "Fujinomiya", "Shizuoka", "Japan", 35.3606, 138.7274, 0.0, List.of(Interest.MOUNTAINS), "Japan's perfectly symmetrical sacred volcano.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408629/fiji_zijvs4.jpg")));
        l.add(p("Sydney Opera House", "Sydney", "New South Wales", "Australia", -33.8568, 151.2153, 30.0, List.of(Interest.CULTURE), "The sail-roofed icon on Sydney Harbour.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408662/opera_xl23io.jpg")));
        l.add(p("Bondi Beach", "Sydney", "New South Wales", "Australia", -33.8908, 151.2743, 0.0, List.of(Interest.BEACH, Interest.SPORTS), "A famous surf beach with a clifftop coastal walk.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408698/bondi_gc17no.jpg")));
        l.add(p("Marina Bay Sands", "Singapore", "Singapore", "Singapore", 1.2834, 103.8607, 23.0, List.of(Interest.SHOPPING), "A rooftop infinity pool above a futuristic skyline.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408742/Marina_Bay_Sands_in_the_evening_-_20101120_wbqdpi.jpg")));
        l.add(p("Table Mountain", "Cape Town", "Western Cape", "South Africa", -33.9628, 18.4098, 28.0, List.of(Interest.MOUNTAINS, Interest.NATURE), "A flat-topped massif reached by rotating cable car.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408775/mount_ya8m3u.jpg")));
        l.add(p("Blue Lagoon", "Grindavík", "Southern Peninsula", "Iceland", 63.8804, -22.4495, 50.0, List.of(Interest.NATURE), "Milky-blue geothermal waters amid black lava fields.", List.of("https://res.cloudinary.com/p5hffsjm/image/upload/v1782408808/blue_ni7zkq.jpg")));

        return l;
    }

    // =====================================================================
    // Weekly opening hours per place (keyed by name, so both the core and the
    // catalog places resolve their schedule at creation time).
    //
    // Only open days are emitted; a missing day means closed. Hours reflect the
    // typical published schedule for real venues, and a coherent day/night
    // pattern for the type of place otherwise (monuments and open public spaces
    // stay open around the clock, parks and reserves keep daytime hours, museums
    // and cultural centres take a weekly closing day, shops and markets run
    // commercial hours). Any place not listed falls back to a sensible daytime
    // default, so newly added places are never left without a schedule.
    // =====================================================================

    static List<OpeningHours> openingHoursFor(String name) {
        return switch (name) {
            // --- Open around the clock: monuments, plazas, avenues, promenades,
            //     open squares, scenic routes and public beaches ---
            case "Obelisco de Buenos Aires", "Quebrada de Humahuaca",
                 "Bosques de Palermo", "Puerto Madero", "Floralis Genérica",
                 "Plaza de Mayo", "Avenida Corrientes", "Congreso de la Nación",
                 "Palermo Soho", "Parque Centenario", "Plaza Dorrego",
                 "Barrancas de Belgrano", "Calle Florida",
                 "Quebrada de Cafayate", "Cerro de los Siete Colores",
                 "Villa Carlos Paz", "La Cumbrecita", "Puerto Madryn Costanera",
                 "Circuito Chico", "Villa La Angostura", "San Martín de los Andes",
                 "Torreón del Monje", "El Chaltén",
                 "Desierto de Atacama", "Rambla de Montevideo", "Punta del Este",
                 "Cartagena Old Town", "Playas de Cancún", "Times Square",
                 "Golden Gate Bridge", "Grand Canyon", "Niagara Falls",
                 "Banff National Park", "Canales de Venecia", "Puerta del Sol",
                 "Big Ben & Westminster", "Brandenburger Tor", "Santorini",
                 "Cruce de Shibuya", "Monte Fuji", "Bondi Beach" -> open24h();

            // --- Parks, reserves and natural areas: daytime hours ---
            case "Cataratas del Iguazú", "Glaciar Perito Moreno", "Cerro Aconcagua",
                 "Cementerio de la Recoleta", "Salinas Grandes", "Salar de Uyuni",
                 "Torres del Paine", "Jardín Botánico Carlos Thays" -> everyDay("08:00", "18:00");
            case "Valle de la Luna (Ischigualasto)", "Chichén Itzá",
                 "Pirámides de Giza", "Table Mountain" -> everyDay("08:00", "17:00");
            case "Parque Nacional Tierra del Fuego", "Península Valdés",
                 "Termas de Río Hondo", "Dique Cabra Corral",
                 "Acrópolis de Atenas" -> everyDay("08:00", "20:00");
            case "Cristo Redentor", "Pão de Açúcar" -> everyDay("08:00", "19:00");
            case "Blue Lagoon" -> everyDay("08:00", "21:00");
            case "Machu Picchu" -> everyDay("06:00", "17:00");
            case "Gran Muralla China" -> everyDay("07:30", "17:30");

            // --- Guided-visit venues: tours, trains, theatres, cableways ---
            case "Cerro Catedral, Bariloche", "Tren del Fin del Mundo",
                 "Teatro Colón", "Sydney Opera House" -> everyDay("09:00", "17:00");
            case "Colosseo", "Park Güell", "Monumento a la Bandera" -> everyDay("09:00", "19:00");
            case "Sagrada Família" -> everyDay("09:00", "20:00");
            case "Tour Eiffel" -> everyDay("09:00", "23:45");
            case "Tower Bridge" -> everyDay("09:30", "18:00");
            case "Bodega en Luján de Cuyo" -> everyDay("10:00", "17:00");
            case "Caminito, La Boca", "La Bombonera", "Jardín Japonés" -> everyDay("10:00", "18:00");
            case "Estadio Monumental" -> everyDay("10:00", "19:00");
            case "Marina Bay Sands" -> everyDay("11:00", "21:00");
            case "Burj Khalifa", "Mercado de Abasto" -> everyDay("10:00", "22:00");

            // --- Shops, malls, markets, food ---
            case "El Ateneo Grand Splendid" -> everyDay("09:00", "21:00");
            case "Mercado de San Telmo", "Luna Park" -> everyDay("10:00", "20:00");
            case "Galerías Pacífico", "Distrito Arcos" -> everyDay("10:00", "21:00");
            case "Barrio Chino de Belgrano" -> everyDay("11:00", "22:00");
            case "Café Tortoni" -> everyDay("08:00", "23:00");
            case "Casa de Ana Frank" -> everyDay("09:00", "22:00");

            // --- Museums and cultural venues with a weekly closing day ---
            case "MALBA" -> everyDayExcept("12:00", "20:00", TUESDAY);
            case "Musée du Louvre" -> everyDayExcept("09:00", "18:00", TUESDAY);
            case "Museo Nacional de Bellas Artes" -> everyDayExcept("11:00", "20:00", MONDAY);
            case "Planetario Galileo Galilei" -> everyDayExcept("12:00", "20:00", MONDAY);
            case "Usina del Arte" -> everyDayExcept("11:00", "19:00", MONDAY);
            case "Reserva Ecológica Costanera Sur" -> everyDayExcept("08:00", "18:00", MONDAY);
            case "Taj Mahal" -> everyDayExcept("06:00", "18:30", FRIDAY); // closed Fridays

            // --- Venues open only on specific days ---
            case "Casa Rosada" -> onDays("10:00", "18:00", SATURDAY, SUNDAY);
            case "Feria de Mataderos" -> onDays("11:00", "20:00", SATURDAY, SUNDAY);
            case "Centro Cultural Kirchner" ->
                    onDays("14:00", "20:00", WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY);
            case "Ciudad Cultural Konex" -> onDays("19:00", "23:59", MONDAY, FRIDAY, SATURDAY);

            default -> everyDay("09:00", "18:00");
        };
    }

    /** Same hours every day of the week. */
    static List<OpeningHours> everyDay(String open, String close) {
        List<OpeningHours> hours = new ArrayList<>();
        for (DayOfWeek day : DayOfWeek.values()) hours.add(slot(day, open, close));
        return hours;
    }

    /** Open around the clock, every day (00:00–23:59 keeps the required open&lt;close ordering). */
    static List<OpeningHours> open24h() {
        return everyDay("00:00", "23:59");
    }

    /** Same hours on the given days only; every other day is closed. */
    static List<OpeningHours> onDays(String open, String close, DayOfWeek... days) {
        List<OpeningHours> hours = new ArrayList<>();
        for (DayOfWeek day : days) hours.add(slot(day, open, close));
        return hours;
    }

    /** Same hours every day except the listed closing days. */
    static List<OpeningHours> everyDayExcept(String open, String close, DayOfWeek... closedDays) {
        List<DayOfWeek> closed = List.of(closedDays);
        List<OpeningHours> hours = new ArrayList<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            if (!closed.contains(day)) hours.add(slot(day, open, close));
        }
        return hours;
    }

    private static OpeningHours slot(DayOfWeek day, String open, String close) {
        return new OpeningHours(day, LocalTime.parse(open), LocalTime.parse(close));
    }

    // =====================================================================
    // Plan title / description generators (one plan per new place).
    // =====================================================================

    static String planTitle(Interest i, String city, Random rng) {
        String c = (city == null || city.isBlank()) ? "la ciudad" : city;
        String[] t = switch (i) {
            case FOOD -> new String[]{"Recorrida gastronómica por {c}", "Noche de sabores en {c}", "Tour de cafés y bares en {c}"};
            case CULTURE -> new String[]{"Tarde cultural en {c}", "Recorrido de arte en {c}", "Día de museos en {c}"};
            case NATURE -> new String[]{"Caminata y naturaleza en {c}", "Día al aire libre en {c}", "Escapada verde a {c}"};
            case MOUNTAINS -> new String[]{"Trekking en {c}", "Montaña y senderismo en {c}", "Aventura serrana en {c}"};
            case BEACH -> new String[]{"Día de playa en {c}", "Sol y costa en {c}", "Tarde frente al mar en {c}"};
            case ADVENTURE -> new String[]{"Aventura en {c}", "Día de adrenalina en {c}", "Salida a pura acción en {c}"};
            case NIGHTLIFE -> new String[]{"Noche en {c}", "Salida nocturna por {c}", "After y música en {c}"};
            case SPORTS -> new String[]{"Jornada deportiva en {c}", "Partido y deporte en {c}", "Día activo en {c}"};
            case SHOPPING -> new String[]{"Día de compras en {c}", "Recorrida de tiendas en {c}", "Paseo de shopping en {c}"};
            case HISTORY -> new String[]{"Recorrido histórico por {c}", "Patrimonio y memoria en {c}", "Día de historia en {c}"};
            default -> new String[]{"Plan en {c}", "Salida grupal en {c}", "Encuentro en {c}"};
        };
        return pick(t, rng).replace("{c}", c);
    }

    static String planDescription(String place, Random rng) {
        String[] d = new String[]{
                "Meeting up around " + place + " for a relaxed few hours together.",
                "A casual outing centred on " + place + " — everyone is welcome.",
                "Exploring " + place + " at an easy pace, with plenty of time to chat.",
                "Group plan at " + place + "; bring good vibes and comfy shoes.",
                "Discovering " + place + " together and grabbing a bite nearby afterwards.",
                "A friendly get-together to enjoy " + place + " without rushing."
        };
        return pick(d, rng);
    }

    // =====================================================================
    // Rating distribution (natural mix, biased by author personality).
    // index 0 -> 1 star ... index 4 -> 5 stars.
    // =====================================================================

    static int[] ratingWeights(String personality) {
        return switch (personality == null ? "default" : personality) {
            case "entusiasta" -> new int[]{2, 4, 12, 30, 52};
            case "amable" -> new int[]{2, 5, 15, 38, 40};
            case "sociable" -> new int[]{3, 7, 20, 40, 30};
            case "aventurero" -> new int[]{4, 8, 18, 35, 35};
            case "detallista" -> new int[]{6, 12, 24, 34, 24};
            case "profesional" -> new int[]{6, 12, 28, 32, 22};
            case "practico" -> new int[]{8, 14, 28, 30, 20};
            case "reservado" -> new int[]{8, 16, 30, 28, 18};
            case "exigente" -> new int[]{12, 22, 32, 22, 12};
            case "critico" -> new int[]{18, 26, 30, 18, 8};
            default -> new int[]{8, 12, 20, 32, 28};
        };
    }

    static int weightedRating(int[] weights, Random rng) {
        int total = 0;
        for (int w : weights) total += w;
        int r = rng.nextInt(total);
        int acc = 0;
        for (int i = 0; i < weights.length; i++) {
            acc += weights[i];
            if (r < acc) return i + 1;
        }
        return weights.length;
    }

    // =====================================================================
    // Review text banks (indexed by rating-1). Assembled as opener + aspect.
    // =====================================================================

    static String venueComment(int rating, String place, Random rng) {
        String opener = pick(VENUE_OPENERS[rating - 1], rng).replace("{place}", place);
        String aspect = pick(VENUE_ASPECTS[rating - 1], rng);
        return opener + " " + aspect;
    }

    static String userComment(int rating, String name, Random rng) {
        String opener = pick(USER_OPENERS[rating - 1], rng).replace("{name}", name);
        String aspect = pick(USER_ASPECTS[rating - 1], rng);
        return opener + " " + aspect;
    }

    private static String pick(String[] arr, Random rng) {
        return arr[rng.nextInt(arr.length)];
    }

    private static final String[][] VENUE_OPENERS = {
            { // 1 star
                    "Really poor experience at {place}.", "Would not return to {place}.",
                    "{place} was a letdown across the board.", "Sadly, {place} is best avoided.",
                    "{place} was a waste of the trip.", "Deeply disappointed by {place}.",
                    "{place} was the low point of my week.", "Nothing worked at {place}."
            },
            { // 2 stars
                    "{place} was underwhelming.", "Expected more from {place}.",
                    "{place} left me a little disappointed.", "Not great — {place} needs work.",
                    "{place} was below average for me.", "Struggled to enjoy {place}.",
                    "{place} didn't really deliver.", "A bit of a frustrating visit to {place}."
            },
            { // 3 stars
                    "{place} was fine, nothing more.", "Mixed feelings about {place}.",
                    "{place} is okay if you're already in the area.", "An average visit to {place}.",
                    "{place} has potential but fell a bit flat.", "Decent, but {place} didn't wow me.",
                    "{place} was just alright.", "A reasonable stop at {place}, no real highlights."
            },
            { // 4 stars
                    "Really enjoyed {place}.", "{place} was great, with only minor gripes.",
                    "A solid visit to {place}, would recommend.", "{place} is well worth your time.",
                    "A very good experience at {place}.", "Happy I made it to {place}.",
                    "{place} is lovely, just shy of perfect.", "{place} delivered, mostly."
            },
            { // 5 stars
                    "An unforgettable visit to {place}.", "{place} exceeded every expectation.",
                    "Easily one of the best places I've been to.", "{place} is a must — I'd go back tomorrow.",
                    "Absolutely loved {place} from start to finish.", "Five stars for {place}, no hesitation.",
                    "{place} completely blew me away.", "A flawless afternoon at {place}."
            }
    };

    private static final String[][] VENUE_ASPECTS = {
            { // 1
                    "Overpriced and badly run.", "Rude service and long waits.",
                    "Dirty and poorly maintained.", "Confusing and hard to navigate.",
                    "Felt unsafe and chaotic.", "Nothing was worth the money.",
                    "A total lack of organisation.", "The queue alone ruined it."
            },
            { // 2
                    "Felt overpriced for what it offers.", "Hard to reach and poorly signposted.",
                    "Service was slow and indifferent.", "Disorganised and busier than expected.",
                    "Could honestly be cleaner.", "Not very accessible.",
                    "Underwhelming for the price.", "We left earlier than planned."
            },
            { // 3
                    "Service was hit or miss.", "Fairly priced but a little crowded.",
                    "Getting there was a bit of a hassle.", "Organisation could be better.",
                    "Nothing wrong, nothing memorable.", "Average facilities for the cost.",
                    "Fine for a quick stop.", "A touch overhyped, honestly."
            },
            { // 4
                    "Good value, with only small gripes.", "Well organised, though a touch crowded.",
                    "Easy to reach and worth the effort.", "Friendly staff and quick service.",
                    "A bit pricey but still recommended.", "Clean and pleasant throughout.",
                    "Lovely spot, just busy at peak times.", "Solid facilities for the price."
            },
            { // 5
                    "The location is stunning and easy to reach.", "Staff were attentive and genuinely helpful.",
                    "Great value for what you get.", "Everything was clean and well organised.",
                    "Felt safe and relaxed the whole time.", "Accessible and clearly signposted.",
                    "The views alone are worth the trip.", "Perfect for an easy half-day out."
            }
    };

    private static final String[][] USER_OPENERS = {
            { // 1
                    "A difficult experience sharing the plan with {name}.", "Wouldn't team up with {name} again.",
                    "{name} let the group down.", "{name} was hard to deal with.",
                    "Communication with {name} broke down.", "{name} didn't pull their weight.",
                    "A disappointing time with {name}.", "{name} rather soured the outing."
            },
            { // 2
                    "Sharing the plan with {name} was a bit awkward.", "{name} was harder to coordinate with than expected.",
                    "{name} didn't engage much with the group.", "A slightly frustrating time with {name}.",
                    "{name} could have been more considerate.", "Struggled to connect with {name}.",
                    "{name} wasn't quite on the same page.", "{name} made things a little tense."
            },
            { // 3
                    "{name} was okay to share the plan with.", "A mixed experience with {name}.",
                    "{name} was fine, nothing really stood out.", "An average time alongside {name}.",
                    "{name} was alright, if a bit quiet.", "No issues with {name}, no highlights either.",
                    "{name} was so-so to team up with.", "{name} mostly kept to themselves."
            },
            { // 4
                    "{name} was good company overall.", "Enjoyed sharing the plan with {name}.",
                    "{name} was easy to get along with.", "A good experience teaming up with {name}.",
                    "{name} fit in well with the group.", "Would happily meet up with {name} again.",
                    "{name} was reliable and friendly.", "{name} made the day easy."
            },
            { // 5
                    "{name} was fantastic company on the plan.", "Couldn't ask for better company than {name}.",
                    "{name} made the whole outing better.", "A real pleasure sharing the plan with {name}.",
                    "{name} is exactly who you want on a plan.", "Hands down, {name} was great to team up with.",
                    "{name} set the tone for a perfect day.", "So glad {name} joined."
            }
    };

    private static final String[][] USER_ASPECTS = {
            { // 1
                    "Showed up late with no warning.", "Barely communicated the whole time.",
                    "Didn't respect the group's plans.", "Took no responsibility at all.",
                    "Created friction within the group.", "Unreliable from start to finish.",
                    "Made coordinating a real chore.", "Disengaged and inconsiderate."
            },
            { // 2
                    "Turned up late and a bit unprepared.", "Communication was patchy.",
                    "Didn't contribute much to the group.", "A little inconsiderate at times.",
                    "Coordination was harder than it needed to be.", "Engagement was low throughout.",
                    "Could have been more reliable.", "Left the organising to everyone else."
            },
            { // 3
                    "Communication was okay, could be clearer.", "Mostly on time, a little disorganised.",
                    "Took part but kept a low profile.", "Respectful, if a bit passive.",
                    "Did their share, nothing extra.", "Reasonable attitude, average involvement.",
                    "Fine to coordinate with, mostly.", "Showed up, but wasn't very engaged."
            },
            { // 4
                    "Punctual and easy to communicate with.", "Pitched in and respected everyone's pace.",
                    "Well organised, with only minor hiccups.", "Friendly and responsible throughout.",
                    "Good group attitude overall.", "Showed up prepared and on time.",
                    "Communicative and considerate.", "A dependable plan partner."
            },
            { // 5
                    "Punctual, respectful and great at communicating.", "Organised the details and kept everyone in the loop.",
                    "Easy-going and considerate with the whole group.", "Showed up on time and fully prepared.",
                    "Took real responsibility for the plan.", "Positive attitude from start to finish.",
                    "A natural at bringing people together.", "Reliable and genuinely thoughtful."
            }
    };
}
