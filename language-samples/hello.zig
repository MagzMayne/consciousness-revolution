// Zig sample for GitHub language detection
// BarbrickDesign - Complete Language Portfolio

const std = @import("std");

const Greeter = struct {
    message: []const u8,
    
    pub fn greet(self: Greeter) void {
        std.debug.print("{s}\n", .{self.message});
    }
};

pub fn main() !void {
    const greeter = Greeter{ .message = "Hello from Zig!" };
    greeter.greet();
    
    // Array
    const numbers = [_]i32{ 1, 2, 3, 4, 5 };
    var doubled: [5]i32 = undefined;
    
    for (numbers, 0..) |num, i| {
        doubled[i] = num * 2;
    }
    
    // Struct
    const Info = struct {
        language: []const u8,
        paradigm: []const u8,
        typing: []const u8,
    };
    
    const info = Info{
        .language = "Zig",
        .paradigm = "Procedural",
        .typing = "Static",
    };
    
    // Loop
    const languages = [_][]const u8{ "zig", "c", "rust" };
    for (languages) |lang| {
        std.debug.print("{s}\n", .{lang});
    }
    
    std.debug.print("{any}\n", .{doubled});
    std.debug.print("{s}\n", .{info.language});
}
