# CMake sample for GitHub language detection
# BarbrickDesign - Complete Language Portfolio

cmake_minimum_required(VERSION 3.10)

project(HelloWorld VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Add executable
add_executable(hello
    hello.cpp
    greeter.cpp
)

# Add include directories
target_include_directories(hello PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

# Add compile definitions
target_compile_definitions(hello PRIVATE
    HELLO_VERSION="1.0"
    BUILD_TYPE="${CMAKE_BUILD_TYPE}"
)

# Add compile options
if(MSVC)
    target_compile_options(hello PRIVATE /W4)
else()
    target_compile_options(hello PRIVATE -Wall -Wextra -pedantic)
endif()

# Add library
add_library(greeter_lib STATIC
    greeter.cpp
)

# Link libraries
target_link_libraries(hello PRIVATE greeter_lib)

# Install targets
install(TARGETS hello
    RUNTIME DESTINATION bin
)

# Testing
enable_testing()
add_test(NAME hello_test COMMAND hello)
