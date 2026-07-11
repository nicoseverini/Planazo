package com.planazo.common.exception;

public class LocationNotFoundException extends RuntimeException {
    public LocationNotFoundException() {
        super("We couldn't find that location. Please add more detail, such as the street number, city, and country.");
    }

    public LocationNotFoundException(String message) {
        super(message);
    }
}
