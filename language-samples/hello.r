# R sample for GitHub language detection
# BarbrickDesign - Complete Language Portfolio

Greeter <- setRefClass("Greeter",
  fields = list(message = "character"),
  methods = list(
    greet = function() {
      cat(message, "\n")
    }
  )
)

main <- function() {
  greeter <- Greeter$new(message = "Hello from R!")
  greeter$greet()
  
  # Vector
  numbers <- c(1, 2, 3, 4, 5)
  doubled <- numbers * 2
  
  # List
  info <- list(
    language = "R",
    paradigm = "Multi-paradigm",
    typing = "Dynamic"
  )
  
  # Apply functions
  languages <- c("R", "Python", "Julia")
  upper <- sapply(languages, toupper)
  
  # Data frame
  df <- data.frame(
    name = c("R", "Python", "Julia"),
    year = c(1993, 1991, 2012)
  )
  
  print(df)
  print(upper)
}

main()
