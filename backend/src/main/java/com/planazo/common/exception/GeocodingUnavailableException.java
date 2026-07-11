package com.planazo.common.exception;

public class GeocodingUnavailableException extends RuntimeException {
    public GeocodingUnavailableException(Throwable cause) {
        super("The location service is temporarily unavailable. Please try again in a few moments.", cause);
    }
}
