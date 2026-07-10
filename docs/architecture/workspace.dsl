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

        googleMaps = softwareSystem "Google Maps Platform" "Provides maps, geocoding and location-related services." "External"

        emailService = softwareSystem "Email Service" "External email delivery service used to send verification and notification emails." "External"


        // =========================================================================
        // Software Systems
        // =========================================================================

        planazo = softwareSystem "Planazo" "Platform that connects tourists and locals through activities and tourist places." "Internal"


        // =========================================================================
        // Relationships
        // (Las relaciones deberían expresar el propósito de la interacción, no el protocolo)
        // =========================================================================

        user -> planazo "Uses"

        administrator -> planazo "Manages"

        planazo -> googleMaps "Retrieves maps and geolocation data"

        planazo -> emailService "Sends verification and notification emails"
    }

    views {

        // =========================================================================
        // System Context
        // =========================================================================

        systemContext planazo "systemContext" "System Context Diagram" {

            // indica que se incluyan todos los elementos relacionados con planazo
            include *

            // organiza el diagrama automáticamente de izquierda a derecha
            autoLayout lr

        }


        // =========================================================================
        // Container Views
        // =========================================================================

        

        // =========================================================================
        // Component Views
        // =========================================================================
        
        styles {
            element "Person" {
                background #0B6EFD
                color #FFFFFF
                shape Person
            }

            element "Software System" {
                background #1168BD
                color #FFFFFF
                stroke #000000
            }

            element "External" {
                background #999999
                color #FFFFFF
                stroke #000000
            }

            element "Internal" {
                background #2E7D32
                color #FFFFFF
                stroke #000000
            }

        }

    }

}
