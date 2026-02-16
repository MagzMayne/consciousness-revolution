-- VHDL sample for GitHub language detection
-- BarbrickDesign - Complete Language Portfolio

library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.NUMERIC_STD.ALL;

entity hello is
    Port ( clk : in STD_LOGIC;
           reset : in STD_LOGIC;
           data_out : out STD_LOGIC_VECTOR(7 downto 0));
end hello;

architecture Behavioral of hello is
    signal counter : unsigned(7 downto 0) := (others => '0');
    type state_type is (IDLE, RUNNING, DONE);
    signal state : state_type := IDLE;
begin
    process(clk, reset)
    begin
        if reset = '1' then
            counter <= (others => '0');
            state <= IDLE;
        elsif rising_edge(clk) then
            case state is
                when IDLE =>
                    counter <= (others => '0');
                    state <= RUNNING;
                when RUNNING =>
                    counter <= counter + 1;
                    if counter = 255 then
                        state <= DONE;
                    end if;
                when DONE =>
                    state <= IDLE;
            end case;
        end if;
    end process;
    
    data_out <= std_logic_vector(counter);
end Behavioral;
