package com.planazo.common.exception;

public class InvalidAgeRangeException extends RuntimeException {
    public InvalidAgeRangeException() {
        super("Minimum age must be less than maximum age");
    }
}
