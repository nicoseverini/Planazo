package com.planazo.common.exception;

public class ItemNotFoundException extends Exception {
    public ItemNotFoundException(String entity, String title) {
        super(String.format("Failed to find %s with id %s", entity, title));
    }
}
