package com.planazo.common.exception;

public class InvalidMaxSubscribersException extends RuntimeException {
    public InvalidMaxSubscribersException() {
        super("Max participants must be between 1 and 99,999.");
    }
}
