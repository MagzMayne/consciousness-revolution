-- Lua sample for GitHub language detection
-- BarbrickDesign - Complete Language Portfolio

local Greeter = {}
Greeter.__index = Greeter

function Greeter:new(message)
    local instance = setmetatable({}, Greeter)
    instance.message = message
    return instance
end

function Greeter:greet()
    print(self.message)
end

function main()
    local greeter = Greeter:new("Hello from Lua!")
    greeter:greet()
    
    -- Table (array)
    local numbers = {1, 2, 3, 4, 5}
    local doubled = {}
    for i, num in ipairs(numbers) do
        doubled[i] = num * 2
    end
    
    -- Table (map)
    local info = {
        language = "Lua",
        paradigm = "Multi-paradigm",
        typing = "Dynamic"
    }
    
    -- Iteration
    local languages = {"lua", "python", "ruby"}
    for _, lang in ipairs(languages) do
        print(string.upper(lang))
    end
    
    -- Print results
    for _, v in ipairs(doubled) do
        io.write(v .. " ")
    end
    print()
end

main()
