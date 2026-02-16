/**
 * C sample for GitHub language detection
 * BarbrickDesign - Complete Language Portfolio
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct Language {
    char name[50];
    char paradigm[50];
    char typing[50];
};

void greet(const char* message) {
    printf("%s\n", message);
}

int main() {
    greet("Hello from C!");
    
    // Struct
    struct Language c_lang;
    strcpy(c_lang.name, "C");
    strcpy(c_lang.paradigm, "Procedural");
    strcpy(c_lang.typing, "Static");
    
    // Array
    int numbers[] = {1, 2, 3, 4, 5};
    int size = sizeof(numbers) / sizeof(numbers[0]);
    
    // Loop
    for (int i = 0; i < size; i++) {
        printf("%d ", numbers[i] * 2);
    }
    printf("\n");
    
    return 0;
}
