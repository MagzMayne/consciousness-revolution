// Verilog sample for GitHub language detection
// BarbrickDesign - Complete Language Portfolio

module hello (
    input wire clk,
    input wire reset,
    output reg [7:0] data_out
);

    reg [7:0] counter;
    reg [1:0] state;
    
    localparam IDLE = 2'b00;
    localparam RUNNING = 2'b01;
    localparam DONE = 2'b10;
    
    always @(posedge clk or posedge reset) begin
        if (reset) begin
            counter <= 8'h00;
            state <= IDLE;
            data_out <= 8'h00;
        end else begin
            case (state)
                IDLE: begin
                    counter <= 8'h00;
                    state <= RUNNING;
                end
                RUNNING: begin
                    counter <= counter + 1;
                    if (counter == 8'hFF) begin
                        state <= DONE;
                    end
                end
                DONE: begin
                    state <= IDLE;
                end
                default: begin
                    state <= IDLE;
                end
            endcase
            data_out <= counter;
        end
    end

endmodule
