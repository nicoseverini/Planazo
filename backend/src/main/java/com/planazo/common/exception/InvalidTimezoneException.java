package com.planazo.common.exception;

public class InvalidTimezoneException extends RuntimeException {
    public InvalidTimezoneException(String timezone) {
        super("The time zone \"" + timezone + "\" is not recognized. Please use a valid IANA time zone identifier (e.g., \"America/New_York\", \"Europe/Madrid\").");
    }
}
