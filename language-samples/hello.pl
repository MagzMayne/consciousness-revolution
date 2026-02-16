#!/usr/bin/env perl
# Perl sample for GitHub language detection
# BarbrickDesign - Complete Language Portfolio

use strict;
use warnings;

package Greeter;

sub new {
    my ($class, $message) = @_;
    my $self = {
        message => $message
    };
    bless $self, $class;
    return $self;
}

sub greet {
    my ($self) = @_;
    print $self->{message} . "\n";
}

package main;

sub main {
    my $greeter = Greeter->new("Hello from Perl!");
    $greeter->greet();
    
    # Array
    my @numbers = (1, 2, 3, 4, 5);
    my @doubled = map { $_ * 2 } @numbers;
    
    # Hash
    my %info = (
        language => "Perl",
        paradigm => "Multi-paradigm",
        typing => "Dynamic"
    );
    
    # Loop
    my @languages = ("Perl", "Python", "Ruby");
    foreach my $lang (@languages) {
        print uc($lang) . "\n";
    }
}

main();
