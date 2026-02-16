/* Assembly (x86_64) sample for GitHub language detection
   BarbrickDesign - Complete Language Portfolio */

section .data
    hello_msg db "Hello from Assembly!", 0x0A
    hello_len equ $ - hello_msg

section .bss

section .text
    global _start

_start:
    ; Write hello message to stdout
    mov rax, 1          ; sys_write
    mov rdi, 1          ; stdout
    mov rsi, hello_msg  ; message address
    mov rdx, hello_len  ; message length
    syscall
    
    ; Initialize counter
    mov rcx, 5          ; loop counter
    mov rbx, 1          ; current number

print_loop:
    ; Print number (simplified)
    push rcx
    mov rax, rbx
    call print_number
    pop rcx
    
    ; Increment and loop
    inc rbx
    loop print_loop
    
    ; Exit program
    mov rax, 60         ; sys_exit
    xor rdi, rdi        ; exit code 0
    syscall

print_number:
    ; Simplified number printing
    ret
