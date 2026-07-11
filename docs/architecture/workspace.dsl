workspace "Planazo" "Architecture documentation using the C4 model" {
    
    //  Esto evita colisiones cuando existan componentes con nombres similares en distintos contenedores.
    !identifiers hierarchical

    model {

        // =========================================================================
        // People
        // =========================================================================

        user = person "User" "Registered user who interacts with the platform through the mobile application." "User"

        administrator = person "Administrator" "Platform administrator who manages the application through the web administration panel." "Admin"

        // =========================================================================
        // External Systems
        // =========================================================================

        mapProvider = softwareSystem "Map Provider" "Renders interactive maps and resolves device geolocation on the mobile app (Google Maps on Android, Apple Maps on iOS)." "External"

        openStreetMap = softwareSystem "OpenStreetMap" "Provides address geocoding through the Nominatim service." "External"

        geminiAI = softwareSystem "Google Gemini" "Generative AI service used to translate user-generated content between Spanish and English." "External"

        emailService = softwareSystem "Email Service" "External email delivery service used to send verification and notification emails." "External"


        // =========================================================================
        // Software Systems
        // =========================================================================

        planazoSystem = softwareSystem "Planazo" "Platform that connects tourists and locals through activities and tourist places." "Internal" {
            mobileApp = container "Mobile App" "" "React Native + Expo + TypeScript" "Frontend"
            webPanelUI = container "Web Panel UI" "" "HTML + CSS + TypeScript" "Frontend"
            backendAPI = container "Backend API" "Implements the business logic and exposes a REST API." "Java 21 + Spring Boot" "Backend"
            db = container "Database" "" "PostgreSQL" "Database"
            //authAPI = container // [No estoy seguro si web-auth es un contendor aparte o como debe ser considerado]
        }


        // =========================================================================
        // Relationships
        // (Las relaciones deberían expresar el propósito de la interacción, no el protocolo)
        // =========================================================================

        # Context
        user -> planazoSystem "Uses"
        administrator -> planazoSystem "Manages"
        planazoSystem -> mapProvider "Renders interactive maps"
        planazoSystem -> openStreetMap "Geocodes addresses"
        planazoSystem -> geminiAI "Translates user-generated content"
        planazoSystem -> emailService "Sends verification and notification emails"

        # Containers
        user -> planazoSystem.mobileApp "Uses"
        administrator -> planazoSystem.webPanelUI "Uses"
        planazoSystem.mobileApp -> planazoSystem.backendAPI "HTTPS"
        planazoSystem.webPanelUI -> planazoSystem.backendAPI "HTTPS"
        planazoSystem.mobileApp -> mapProvider "Renders interactive maps and reads device location [SDK]"
        planazoSystem.backendAPI -> planazoSystem.db "Reads from and writes to [TCP]"
        planazoSystem.backendAPI -> openStreetMap "Geocodes addresses [HTTPS]"
        planazoSystem.backendAPI -> geminiAI "Translates user-generated content [HTTPS]"
        planazoSystem.backendAPI -> emailService "Sends verification and notification emails [HTTPS]"
    }

    views {

        // =========================================================================
        // System Context
        // =========================================================================

        systemContext planazoSystem "systemContext" "System Context Diagram" {

            // indica que se incluyan todos los elementos relacionados con planazoSystem
            include *

            // organiza el diagrama automáticamente de izquierda a derecha
            autoLayout lr

        }


        // =========================================================================
        // Container Views
        // =========================================================================

        container planazoSystem {
            include *

            //autoLayout lr
        }

        // =========================================================================
        // Component Views
        // =========================================================================

        styles {
            element "Person" {
                shape Person
                background #0B6EFD
                color #FFFFFF
            }

            element "Software System" {
                background #1168BD
                color #FFFFFF
                stroke #000000
                strokeWidth 2
            }

            element "External" {
                background #999999
                color #FFFFFF
                stroke #000000
                strokeWidth 2
            }

            element "Internal" {
                background #2E7D32
                color #FFFFFF
                stroke #000000
                strokeWidth 2
            }

            element "Database" {
                shape Cylinder
                background #F57C00
                color white
                stroke #000000
                strokeWidth 2
            }

            element "Backend" {
                background #1565C0
                color #FFFFFF
                stroke #000000
                strokeWidth 2
            }

            element "Frontend" {
                background #2E7D32
                color #FFFFFF
                stroke #000000
                strokeWidth 2
            }
        }
    }

}
