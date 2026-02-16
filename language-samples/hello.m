/**
 * Objective-C sample for GitHub language detection
 * BarbrickDesign - Complete Language Portfolio
 */

#import <Foundation/Foundation.h>

@interface Greeter : NSObject
@property (nonatomic, strong) NSString *message;
- (instancetype)initWithMessage:(NSString *)message;
- (void)greet;
@end

@implementation Greeter

- (instancetype)initWithMessage:(NSString *)message {
    self = [super init];
    if (self) {
        _message = message;
    }
    return self;
}

- (void)greet {
    NSLog(@"%@", self.message);
}

@end

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        Greeter *greeter = [[Greeter alloc] initWithMessage:@"Hello from Objective-C!"];
        [greeter greet];
        
        // Array
        NSArray *numbers = @[@1, @2, @3, @4, @5];
        NSMutableArray *doubled = [NSMutableArray array];
        for (NSNumber *num in numbers) {
            [doubled addObject:@([num intValue] * 2)];
        }
        
        // Dictionary
        NSDictionary *info = @{
            @"language": @"Objective-C",
            @"paradigm": @"Object-oriented",
            @"typing": @"Static"
        };
        
        NSLog(@"%@", info);
    }
    return 0;
}
