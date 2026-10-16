package dev.hafiz.portfolio.common;

public class NotFoundException extends RuntimeException {

    public NotFoundException(String entityType, Object id) {
        super(entityType + " " + id + " not found");
    }
}
