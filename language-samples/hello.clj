; Clojure sample for GitHub language detection
; BarbrickDesign - Complete Language Portfolio

(ns hello
  (:gen-class))

(defrecord Greeter [message])

(defn greet [greeter]
  (println (:message greeter)))

(defn -main []
  (let [greeter (->Greeter "Hello from Clojure!")]
    (greet greeter)
    
    ; Vector
    (let [numbers [1 2 3 4 5]
          doubled (map #(* % 2) numbers)]
      (println doubled))
    
    ; Map
    (let [info {:language "Clojure"
                :paradigm "Functional"
                :typing "Dynamic"}]
      (println info))
    
    ; Collection functions
    (let [languages ["clojure" "scala" "erlang"]]
      (doseq [lang languages]
        (println (.toUpperCase lang))))
    
    ; Thread-first macro
    (-> [1 2 3 4 5]
        (map inc)
        (filter even?)
        println)))

(-main)
