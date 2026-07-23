package com.planazo.common.exception;

public class AgeRestrictionException extends RuntimeException {
    public AgeRestrictionException() {
        super("You don't meet this plan's age requirements.");
    }
}
