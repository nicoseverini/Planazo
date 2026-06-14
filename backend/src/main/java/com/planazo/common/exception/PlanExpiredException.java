package com.planazo.common.exception;

public class PlanExpiredException extends RuntimeException {
    public PlanExpiredException(String planTitle) {
        super("Plan '" + planTitle + "' has already ended.");
    }
}
