;;; Lisp sample for GitHub language detection
;;; BarbrickDesign - Complete Language Portfolio

(defclass greeter ()
  ((message :initarg :message
            :accessor greeter-message)))

(defmethod greet ((g greeter))
  (format t "~a~%" (greeter-message g)))

(defun main ()
  (let ((greeter (make-instance 'greeter :message "Hello from Lisp!")))
    (greet greeter)
    
    ;; List
    (let ((numbers '(1 2 3 4 5)))
      (let ((doubled (mapcar #'(lambda (x) (* x 2)) numbers)))
        (format t "~a~%" doubled)))
    
    ;; Association list
    (let ((info '((language . "Lisp")
                  (paradigm . "Multi-paradigm")
                  (typing . "Dynamic"))))
      (format t "~a~%" info))
    
    ;; Higher-order functions
    (let ((languages '("lisp" "scheme" "clojure")))
      (mapcar #'(lambda (lang)
                  (format t "~a~%" (string-upcase lang)))
              languages))))

(main)
