% MATLAB sample for GitHub language detection
% BarbrickDesign - Complete Language Portfolio

classdef GreeterMatlab
    properties
        message
    end
    
    methods
        function obj = GreeterMatlab(message)
            obj.message = message;
        end
        
        function greet(obj)
            disp(obj.message);
        end
    end
end

function main()
    greeter = GreeterMatlab('Hello from MATLAB!');
    greeter.greet();
    
    % Array
    numbers = [1, 2, 3, 4, 5];
    doubled = numbers * 2;
    
    % Cell array
    languages = {'MATLAB', 'Octave', 'Julia'};
    
    % Loop
    for i = 1:length(languages)
        disp(upper(languages{i}));
    end
    
    % Matrix operations
    A = [1 2; 3 4];
    B = [5 6; 7 8];
    C = A * B;
    
    disp(C);
end

main();
