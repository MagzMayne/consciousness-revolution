// OVERKILL KULTURE - FULL MUSIC CATALOG
// 71 FREE tracks + 20 PAID tracks = 91 total

const MUSIC_CATALOG = {
    albums: {
        'overkill-tapes': {
            title: 'The Overkill Tapes',
            tracks: 14,
            year: 2024,
            price: 'FREE',
            cover: '📼',
            songs: [
                'Sucker for wheelin',
                'Wheelin war',
                '509 Spring Ride',
                'Two Wheels On Fire',
                'Hangover Run',
                'Joint in the Studio Jumanji V',
                'Roach in the Carpet',
                'Overkill Revolution',
                'Overkill Is The Cure',
                'Color Is the Cure',
                'Editing Heroes',
                'The Printers Curse',
                'Nicks and Dereks Wild Ride',
                'Truck go what?'
            ]
        },
        'overkill-chronicles': {
            title: 'The Overkill Chronicles',
            tracks: 20,
            year: 2024,
            price: 'FREE',
            cover: '📖',
            songs: [
                'Overkill Cure',
                'Overkill in Gear',
                'Rescuers Down Underkill',
                'Shake off the Law',
                'Spokane Lights',
                'Spokane Knights',
                'PNW Glow',
                '509s Kor',
                'Shadows stole the Light',
                'Titanium Reigns',
                'Bogs n Blaze',
                'Tank Trap Overkill',
                'Woke up with a dream',
                'PowerShell Popcorn',
                'Debug Our Lives',
                'Woke up in the cloud',
                'Derek and Jaysons AI Adventure',
                'Where Spokane horizons blend',
                'OVERKILL ANTHEM: ESCAPE VELOCITY',
                'Make It Flow'
            ]
        },
        'overkill-signal': {
            title: 'The Overkill Signal',
            tracks: 17,
            year: 2024,
            price: 'FREE',
            cover: '📡',
            songs: [
                'Painters of the Kor',
                'Living In Dimensions',
                'They said I was crazy',
                'Had a Jeep that turned some heads',
                'Circuits in Bloom',
                'Runs Things Over',
                'Jaysons Anthem Round 2',
                'The Spark Returns',
                'He Is the Signal',
                'Zombie cats',
                'Dodges n Fords',
                'THE DECK BUILDERS MUSHROOM MISSION',
                'SPORE SCORE 2: QUARTERLY SPORECAST',
                'Nascar Donut Paradox',
                'NPC Darrell',
                'Green Machine',
                'Vibing with the Flow'
            ]
        },
        'hive-mind': {
            title: 'Hive Mind 1',
            tracks: 15,
            year: 2023,
            price: 'FREE',
            cover: '🧠',
            songs: []
        },
        'hive-mind-2': {
            title: 'Hive Mind 2',
            tracks: 20,
            year: 2026,
            price: '$10',
            cover: '🧠²',
            streaming: {
                spotify: 'https://open.spotify.com/album/4oaDSIivoTs5oaTe9dmxK6',
                apple: 'https://music.apple.com/album/hive-mind-2',
                youtube: 'https://youtube.com/@overkillkulture'
            },
            songs: [
                'D Train',
                'PATTERNATOR',
                'CREATORS REBELLION',
                'LEVEL 8 RAP STACK',
                'Encrypted and zipped',
                'KICKSTART REVOLUTION',
                'Fisher Price Destroyer',
                'Lights Come On',
                'Corrupted NAS',
                'Clark here at Level MAX',
                'The Pheonix Rizes',
                'RECIPROCITY REVELATION',
                'Joint in the sauna',
                'cars and Coffee',
                'Dads still Here',
                'FRIDAY THE 13TH: Court horror',
                'Vanishing Point',
                'Giving Tree Boundaries',
                'The three seekers',
                'Stand your Ground'
            ]
        }
    },

    // Stats
    getTotalTracks() {
        return Object.values(this.albums).reduce((sum, album) => sum + album.tracks, 0);
    },

    getFreeTracks() {
        return Object.values(this.albums)
            .filter(a => a.price === 'FREE')
            .reduce((sum, album) => sum + album.tracks, 0);
    },

    getPaidTracks() {
        return Object.values(this.albums)
            .filter(a => a.price !== 'FREE')
            .reduce((sum, album) => sum + album.tracks, 0);
    },

    // Build playlist
    buildPlaylist(albumKey = null) {
        const playlist = [];
        const frequencies = [432, 528, 639, 741];

        const albums = albumKey
            ? { [albumKey]: this.albums[albumKey] }
            : this.albums;

        Object.entries(albums).forEach(([key, album]) => {
            album.songs.forEach((song, index) => {
                playlist.push({
                    id: `${key}-${index}`,
                    title: song,
                    artist: 'Overkill Kulture',
                    album: album.title,
                    albumKey: key,
                    frequency: frequencies[index % frequencies.length],
                    price: album.price,
                    streaming: album.streaming || null
                });
            });
        });

        return playlist;
    },

    // Search
    search(query) {
        const q = query.toLowerCase();
        const playlist = this.buildPlaylist();
        return playlist.filter(track =>
            track.title.toLowerCase().includes(q) ||
            track.album.toLowerCase().includes(q)
        );
    }
};

// Export for use
if (typeof module !== 'undefined') {
    module.exports = MUSIC_CATALOG;
}

console.log(`🎵 Music Catalog Loaded: ${MUSIC_CATALOG.getTotalTracks()} tracks (${MUSIC_CATALOG.getFreeTracks()} free, ${MUSIC_CATALOG.getPaidTracks()} paid)`);
