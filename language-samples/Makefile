# Makefile sample for GitHub language detection
# BarbrickDesign - Complete Language Portfolio

CC = gcc
CXX = g++
CFLAGS = -Wall -Wextra -O2
CXXFLAGS = -Wall -Wextra -O2 -std=c++17

TARGET = hello
SOURCES = hello.c greeter.c
OBJECTS = $(SOURCES:.c=.o)

.PHONY: all clean install test

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CC) $(CFLAGS) -o $@ $^

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(TARGET) $(OBJECTS)

install: $(TARGET)
	install -m 755 $(TARGET) /usr/local/bin/

test: $(TARGET)
	./$(TARGET)

# Variables demonstration
LANG_NAME = Makefile
LANG_TYPE = Build System

info:
	@echo "Language: $(LANG_NAME)"
	@echo "Type: $(LANG_TYPE)"
	@echo "Targets: all, clean, install, test"
