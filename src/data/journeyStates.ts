import { JourneyState } from '../types';

export const JOURNEY_STATES: JourneyState[] = [
  {
    id: 'state-01',
    stateNumber: 1,
    name: 'Karnataka',
    capital: 'Bengaluru',
    week: 1,
    distanceKm: 120,
    region: 'South',
    coverImage: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600100397608-f010e4210a56?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'The journey of 28 weeks began with tight laces, a 45L backpack, and a heart beating with pure uncertainty.',
    storySnippet: 'Starting from the rocky landscapes of Hampi and the mist-shrouded Western Ghats of Coorg. Stepping onto the first bus out of Bengaluru, with two worn trekking shoes that would soon touch every corner of the country.',
    highlights: ['Hampi boulder sunsets', 'Coorg coffee plantation homestays', 'Jog Falls thunder'],
    memorableEncounter: 'An elder roadside tea vendor in Gokarna who refused money and blessed my boots for the long road ahead.',
    localFood: 'Bisi Bele Bath & Neer Dosa with freshly ground coconut chutney',
    coordinates: { x: 38, y: 72 }
  },
  {
    id: 'state-02',
    stateNumber: 2,
    name: 'Goa',
    capital: 'Panaji',
    week: 2,
    distanceKm: 85,
    region: 'West',
    coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'Beyond the neon shacks lies the silent Goa of ancestral riverbanks and whispering casuarinas.',
    storySnippet: 'Took the rural ferry across the Mandovi river at dawn, exploring the quiet Portuguese-influenced heritage alleys of Fontainhas before hiking to secluded coastal cliffs in Divar Island.',
    highlights: ['Fontainhas heritage walk', 'Divar Island cycling at sunrise', 'Pristine South Goa beaches'],
    memorableEncounter: 'A local fisherman named Francis who shared roasted fish and tales of 40 monsoon sea storms.',
    localFood: 'Goan Fish Curry with red boiled rice & Bebinca',
    coordinates: { x: 32, y: 68 }
  },
  {
    id: 'state-03',
    stateNumber: 3,
    name: 'Maharashtra',
    capital: 'Mumbai',
    week: 3,
    distanceKm: 165,
    region: 'West',
    coverImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'The Sahyadri ridge rises like ancient stone fortresses guarded by warrior ghosts.',
    storySnippet: 'Trekking through the misty Harishchandragad fort during rain. Reached Konkan Kada cliff at sunset where fog rises vertically like a mystic wall.',
    highlights: ['Konkan Kada cliff trek', 'Ajanta & Ellora caves', 'Marine Drive night walk'],
    memorableEncounter: 'A villager at Khireshwar who offered warm jowar bhakri and pitla after a 6-hour rain trek.',
    localFood: 'Spicy Misal Pav, Pitla Bhakri & Kanda Poha',
    coordinates: { x: 36, y: 56 }
  },
  {
    id: 'state-04',
    stateNumber: 4,
    name: 'Gujarat',
    capital: 'Gandhinagar',
    week: 4,
    distanceKm: 140,
    region: 'West',
    coverImage: 'https://images.unsplash.com/photo-1597042034823-3882f059c250?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1597042034823-3882f059c250?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'In the White Rann, salt meets the sky, erasing the horizon into pure silence.',
    storySnippet: 'Walking on the crystalline salt desert of Kutch under a full moon. Slept in a traditional Bhunga tent and watched Kutchi artisans spin mirror embroideries.',
    highlights: ['White Rann of Kutch', 'Rani ki Vav stepwell', 'Gir lion sanctuary borders'],
    memorableEncounter: 'A master weaver in Bhuj who explained how each woven thread holds the color of ancestral sand.',
    localFood: 'Kathiyawadi Thali, Sev Khamani & Dhebra with garlic chutney',
    coordinates: { x: 24, y: 46 }
  },
  {
    id: 'state-05',
    stateNumber: 5,
    name: 'Rajasthan',
    capital: 'Jaipur',
    week: 5,
    distanceKm: 190,
    region: 'North',
    coverImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'The Thar Desert does not speak loudly, it hums a song of golden sand and endurance.',
    storySnippet: 'Hitchhiking between Jodhpur and Jaisalmer. Watched the golden sandstone fort glow amber as dusk fell over the desert dunes.',
    highlights: ['Jaisalmer golden fort', 'Bikaner camel trails', 'Udaipur lake reflections'],
    memorableEncounter: 'A folk musician in Sam dunes singing Kesariya Balam under a sky crowded with stars.',
    localFood: 'Dal Baati Churma, Ker Sangri & Ghewar',
    coordinates: { x: 28, y: 36 }
  },
  {
    id: 'state-06',
    stateNumber: 6,
    name: 'Punjab',
    capital: 'Chandigarh',
    week: 6,
    distanceKm: 95,
    region: 'North',
    coverImage: 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'At the Golden Temple, no soul is a stranger and no traveller sleeps hungry.',
    storySnippet: 'Volunteered in the langar kitchen of Harmandir Sahib, chopping vegetables and washing plates alongside hundreds of kind strangers from every walk of life.',
    highlights: ['Harmandir Sahib night sanctum', 'Sarson fields of rural Gurdaspur', 'Wagah Border march'],
    memorableEncounter: 'A kindly grandfather who served me piping hot kada prasad with both hands full of warmth.',
    localFood: 'Amritsari Kulcha with Chole & thick Lassi in a clay kulhad',
    coordinates: { x: 34, y: 22 }
  },
  {
    id: 'state-07',
    stateNumber: 7,
    name: 'Haryana',
    capital: 'Chandigarh',
    week: 7,
    distanceKm: 80,
    region: 'North',
    coverImage: 'https://images.unsplash.com/photo-1514897575457-c4db467cf78e?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1514897575457-c4db467cf78e?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'Lush mustard fields where mythological legends meet agrarian grit.',
    storySnippet: 'Walking through the ancient lakes of Kurukshetra and the vibrant highways dotted with famous highway dhabas serving fresh buffalo butter.',
    highlights: ['Kurukshetra Brahma Sarovar', 'Pinjore Yadavindra Gardens', 'Highway dhabas of Murthal'],
    memorableEncounter: 'A wrestling coach in a village Akhada who shared stories of Olympic champions made from red earth.',
    localFood: 'Bajre ki Khichdi with Hara Saag and homemade white makkhan',
    coordinates: { x: 38, y: 26 }
  },
  {
    id: 'state-08',
    stateNumber: 8,
    name: 'Himachal Pradesh',
    capital: 'Shimla',
    week: 8,
    distanceKm: 130,
    region: 'North',
    coverImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'High in Spiti Valley, the mountains touch the heavens and human ego dissolves completely.',
    storySnippet: 'Rode a local state transport bus over Rohtang Pass into the barren wonderland of Spiti. Visited the 1000-year-old Key Monastery perched high on a cliff.',
    highlights: ['Key Monastery cliff chant', 'Chhitkul last village border', 'Chandratal moon lake reflection'],
    memorableEncounter: 'A Buddhist lama who handed me a cup of butter tea while snow began dusting the monastery courtyard.',
    localFood: 'Siddu with ghee, Thukpa & steaming Tibetan Momos',
    coordinates: { x: 40, y: 16 }
  },
  {
    id: 'state-09',
    stateNumber: 9,
    name: 'Uttarakhand',
    capital: 'Dehradun',
    week: 9,
    distanceKm: 110,
    region: 'North',
    coverImage: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'The roar of the Alaknanda and Bhagirathi rushing to form the sacred mother Ganga.',
    storySnippet: 'Trekking along the Valley of Flowers trail, breathing in alpine air scented with wild blue poppies and pine resin before resting at Devprayag.',
    highlights: ['Devprayag sangam confluence', 'Rishikesh Ganga Aarti by twilight', 'Chopta Tungnath high altitude trek'],
    memorableEncounter: 'A solitary sadhu near Tungnath who meditated with eyes open towards the glowing Nanda Devi peak.',
    localFood: 'Kafli, Chainsoo & hot Bal Mithai',
    coordinates: { x: 44, y: 22 }
  },
  {
    id: 'state-10',
    stateNumber: 10,
    name: 'Uttar Pradesh',
    capital: 'Lucknow',
    week: 10,
    distanceKm: 150,
    region: 'North',
    coverImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'Varanasi is older than history, older than tradition, and looks twice as old as all of them put together.',
    storySnippet: 'Rowing on the holy Ganga at Manikarnika and Dashashwamedh Ghats at 5:30 AM as the crimson sun rose across the misty water.',
    highlights: ['Varanasi boat ride at dawn', 'Lucknow Bara Imambara labyrinths', 'Sarnath deer park ruins'],
    memorableEncounter: 'A boatman named Mangal who recited Kabir poems while rowing against the gentle morning current.',
    localFood: 'Banarasi Paan, Malaiyo, Tunday Kebabs & Bedmi Puri',
    coordinates: { x: 50, y: 34 }
  },
  {
    id: 'state-11',
    stateNumber: 11,
    name: 'Bihar',
    capital: 'Patna',
    week: 11,
    distanceKm: 95,
    region: 'East',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'Sitting beneath the Mahabodhi Tree where Prince Siddhartha transformed into the Buddha.',
    storySnippet: 'Walked the ancient brick ruins of Nalanda University, the world’s first residential university, imagining 10,000 scholars studying under these skies.',
    highlights: ['Mahabodhi Temple enlightenment tree', 'Nalanda Mahavihara ruins', 'Rajgir Vishwa Shanti Stupa'],
    memorableEncounter: 'A young archaeology student who volunteered to guide me through the excavated monasteries of Nalanda.',
    localFood: 'Litti Chokha baked on cow-dung fire with roasted eggplant puree',
    coordinates: { x: 58, y: 36 }
  },
  {
    id: 'state-12',
    stateNumber: 12,
    name: 'Jharkhand',
    capital: 'Ranchi',
    week: 12,
    distanceKm: 90,
    region: 'East',
    coverImage: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'The untamed Sal forests and roaring cascades of the Chota Nagpur plateau.',
    storySnippet: 'Discovered the hidden waterfalls of Hundru and Jonha, hearing the folk rhythms of tribal Mandar drums echoing through the lush canopy.',
    highlights: ['Hundru waterfall gorge', 'Netarhat Queen of Chotanagpur sunset', 'Betla National Park sal forest'],
    memorableEncounter: 'A tribal artisan in Khunti who taught me how to make natural plates using dried Sal leaves.',
    localFood: 'Dhuska with Ghugni & Rugda mushroom curry',
    coordinates: { x: 57, y: 44 }
  },
  {
    id: 'state-13',
    stateNumber: 13,
    name: 'West Bengal',
    capital: 'Kolkata',
    week: 13,
    distanceKm: 135,
    region: 'East',
    coverImage: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'Kolkata doesn’t merely exist in geography; it lives passionately in poetry, adda, and monsoon trams.',
    storySnippet: 'Rode the heritage wooden tram through College Street, browsing thousands of second-hand books before hiking the misty tea gardens of Darjeeling.',
    highlights: ['Howrah Bridge night skyline', 'Darjeeling Toy Train Himalayan vista', 'College Street boi para'],
    memorableEncounter: 'A retired professor at Indian Coffee House who debated Rabindranath Tagore’s philosophy over black coffee for 3 hours.',
    localFood: 'Kolkata Kathi Rolls, Shorshe Ilish, Sandesh & Rosogolla',
    coordinates: { x: 64, y: 42 }
  },
  {
    id: 'state-14',
    stateNumber: 14,
    name: 'Sikkim',
    capital: 'Gangtok',
    week: 14,
    distanceKm: 75,
    region: 'North East',
    coverImage: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'Under the watchful gaze of Kangchenjunga, the third highest peak in the world.',
    storySnippet: 'Climbed up to Gurudongmar Lake at 17,800 feet. The emerald water surrounded by pristine snowfields felt like walking on the ceiling of Earth.',
    highlights: ['Gurudongmar sacred lake', 'Rumtek Monastery prayer drums', 'Yumthang Valley of Rhododendrons'],
    memorableEncounter: 'An army jawan at Nathu La pass who offered warm tea and spoke of duty at the frozen frontier.',
    localFood: 'Gundruk soup, Phagshapa & fresh steamed Tingmo buns',
    coordinates: { x: 67, y: 28 }
  },
  {
    id: 'state-15',
    stateNumber: 15,
    name: 'Assam',
    capital: 'Dispur',
    week: 15,
    distanceKm: 145,
    region: 'North East',
    coverImage: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'The mighty Brahmaputra river carries the dreams and lifeblood of an entire civilization.',
    storySnippet: 'Crossed by wooden ferry to Majuli, the world’s largest river island. Witnessed traditional Mask-making and Sattriya dance in ancient Vaishnavite monasteries.',
    highlights: ['Majuli Island mask artisans', 'Kaziranga one-horned rhino safari', 'Kamakhya Temple hill'],
    memorableEncounter: 'A mask maker in Samaguri Satra who sculpted a demon face from bamboo, cow dung, and river clay in 20 minutes.',
    localFood: 'Khaar with fish head, Duck curry with white gourd & Pitha',
    coordinates: { x: 74, y: 30 }
  },
  {
    id: 'state-16',
    stateNumber: 16,
    name: 'Arunachal Pradesh',
    capital: 'Itanagar',
    week: 16,
    distanceKm: 110,
    region: 'North East',
    coverImage: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'Where India first greets the rising sun with prayer flags fluttering in snow peaks.',
    storySnippet: 'Crossed the treacherous Sela Pass at 13,700 ft in biting cold to reach Tawang Monastery, the largest monastery in India founded in 1680.',
    highlights: ['Tawang Monastery 3-storey Buddha', 'Sela Pass lake', 'Ziro Valley Apatani tribal hamlets'],
    memorableEncounter: 'An Apatani village elder woman with traditional facial tattoos who shared smoked pork and rice beer in her stilt house.',
    localFood: 'Zan millet porridge, Pika Pila pickle & Chura sabji with yak cheese',
    coordinates: { x: 80, y: 24 }
  },
  {
    id: 'state-17',
    stateNumber: 17,
    name: 'Nagaland',
    capital: 'Kohima',
    week: 17,
    distanceKm: 85,
    region: 'North East',
    coverImage: 'https://images.unsplash.com/photo-1570784332176-fdd73da66f03?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1570784332176-fdd73da66f03?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'The green slopes of Dzukou Valley where silence is sacred and courage is inherited.',
    storySnippet: 'Trekking through the dwarf bamboo meadows of Dzukou Valley. Watched the morning fog swirl inside the natural mountain amphitheater.',
    highlights: ['Dzukou Valley trekking', 'Kohima War Cemetery memorial', 'Khonoma green eco-village'],
    memorableEncounter: 'A village warrior hunter turned conservation officer who proudly showed how the village saved the Blyth’s tragopan bird.',
    localFood: 'Smoked Pork with Axone (fermented soya) & fiery Raja Mircha chutney',
    coordinates: { x: 82, y: 32 }
  },
  {
    id: 'state-18',
    stateNumber: 18,
    name: 'Manipur',
    capital: 'Imphal',
    week: 18,
    distanceKm: 80,
    region: 'North East',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'Floating biomass islands of Loktak Lake where fishermen live upon moving water.',
    storySnippet: 'Slept inside a wooden homestay built right upon a floating phumdi on Loktak Lake. Spotted the endangered dancing Sangai deer in Keibul Lamjao National Park.',
    highlights: ['Loktak Lake floating phumdis', 'Ima Keithel world’s only all-women market', 'Kangla Fort'],
    memorableEncounter: 'An elderly mother (Ima) at the all-women market in Imphal who gifted me a woven hand towel with genuine maternal love.',
    localFood: 'Kangshoi vegetable stew, Eromba with fermented fish & Singju salad',
    coordinates: { x: 80, y: 38 }
  },
  {
    id: 'state-19',
    stateNumber: 19,
    name: 'Mizoram',
    capital: 'Aizawl',
    week: 19,
    distanceKm: 70,
    region: 'North East',
    coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'The Blue Mountains where honesty is a lifestyle and churches ring harmony across ridgelines.',
    storySnippet: 'Traveled the scenic ridgeline roads of Aizawl. Stumbled upon un-manned roadside vegetable shops with money boxes—pure honesty without CCTV.',
    highlights: ['Nghah Lou Dawr shops of trust', 'Reiek peak scenic ridge trek', 'Vantawng waterfall'],
    memorableEncounter: 'A school teacher in Champhai who invited me into his home for tea when rain stranded my bus on a mountain bend.',
    localFood: 'Bai boiled bamboo shoot stew, Vawksa Rep smoked meat & Sawhchiar rice',
    coordinates: { x: 78, y: 44 }
  },
  {
    id: 'state-20',
    stateNumber: 20,
    name: 'Tripura',
    capital: 'Agartala',
    week: 20,
    distanceKm: 65,
    region: 'North East',
    coverImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'The floating fairytale marble palace of Neermahal mirrored on Rudrasagar lake.',
    storySnippet: 'Explored the ancient rock-cut giant bas-relief carvings of Unakoti nestled deep within the jungle hills, dating back to the 7th century.',
    highlights: ['Unakoti rock-cut Shiva sculptures', 'Neermahal water palace', 'Ujjayanta Palace museum'],
    memorableEncounter: 'A caretaker at Unakoti who described the legend of ninety-nine lakh ninety-nine thousand stone deities.',
    localFood: 'Mui Borok traditional fish dish, Kosoi Bwtwi & Chakhwi with bamboo shoots',
    coordinates: { x: 74, y: 42 }
  },
  {
    id: 'state-21',
    stateNumber: 21,
    name: 'Meghalaya',
    capital: 'Shillong',
    week: 21,
    distanceKm: 85,
    region: 'North East',
    coverImage: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'Walking upon living roots woven by three generations of Khasi tribal elders.',
    storySnippet: 'Hiked 3,500 stone stairs down the canyon to the Double Decker Living Root Bridge in Nongriat. Swam in natural crystal emerald river pools.',
    highlights: ['Nongriat double-decker living root bridge', 'Nohkalikai waterfall plunge', 'Dawki crystal river boating'],
    memorableEncounter: 'A young Khasi guide in Mawlynnong who showed how the village has composted and cleaned every leaf for 100 years.',
    localFood: 'Jadoh rice with pork broth, Dohkhlieh & Tungrymbai',
    coordinates: { x: 72, y: 36 }
  },
  {
    id: 'state-22',
    stateNumber: 22,
    name: 'Odisha',
    capital: 'Bhubaneswar',
    week: 22,
    distanceKm: 120,
    region: 'East',
    coverImage: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'The monumental stone chariot of Konark Sun Temple facing the roaring Bay of Bengal.',
    storySnippet: 'Stood in awe at the intricate erotic and astrological carvings of Konark, before taking a wooden country boat across Chilika Lake watching Irrawaddy dolphins breach.',
    highlights: ['Konark Sun Temple architectural wonder', 'Chilika Lake dolphin sanctuary', 'Raghurajpur heritage pattachitra village'],
    memorableEncounter: 'A master Pattachitra painter who drew an entire Mahabharata chapter on a single dried palm leaf.',
    localFood: 'Chhena Poda (caramelized cottage cheese cake), Dalma & Crab Kassa',
    coordinates: { x: 58, y: 52 }
  },
  {
    id: 'state-23',
    stateNumber: 23,
    name: 'Chhattisgarh',
    capital: 'Raipur',
    week: 23,
    distanceKm: 105,
    region: 'Central',
    coverImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'The Niagara of India, Chitrakote Falls, tumbling across the horseshoe gorge.',
    storySnippet: 'Ventured into the Bastar tribal heartland. Watched metalsmiths practice 4,000-year-old lost-wax Dhokra brass casting by village hearths.',
    highlights: ['Chitrakote horseshoe waterfall', 'Bastar Dhokra metal artisan village', 'Kanger Valley stalactite caves'],
    memorableEncounter: 'A Dhokra artisan who crafted a small bronze tribal traveler figure as a talisman for my journey.',
    localFood: 'Chila pancake with tomato chutney, Muthia & Mahua flower sweets',
    coordinates: { x: 50, y: 50 }
  },
  {
    id: 'state-24',
    stateNumber: 24,
    name: 'Madhya Pradesh',
    capital: 'Bhopal',
    week: 24,
    distanceKm: 160,
    region: 'Central',
    coverImage: 'https://images.unsplash.com/photo-1599831104321-700994f7d79b?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1599831104321-700994f7d79b?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'In the heart of India, ancient temples, wild tigers, and marble river canyons coexist in harmony.',
    storySnippet: 'Drifted between the sheer 100-foot white marble rocks of Bhedaghat in Jabalpur at night while the boatman improvised hilarious rhyming poetry.',
    highlights: ['Bhedaghat marble rocks gorge', 'Khajuraho temple sculptures', 'Sanchi Stupa Buddhist dome'],
    memorableEncounter: 'The marble boatman in Jabalpur whose poetic couplets had the whole boat laughing under moonlight.',
    localFood: 'Bhopali Gosht Korma, Poha Jalebi with Sev, & Dal Bafla',
    coordinates: { x: 44, y: 44 }
  },
  {
    id: 'state-25',
    stateNumber: 25,
    name: 'Telangana',
    capital: 'Hyderabad',
    week: 25,
    distanceKm: 95,
    region: 'South',
    coverImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'The monumental Golconda acoustics where a single handclap travels a kilometer to the mountaintop.',
    storySnippet: 'Explored the Qutb Shahi royal tombs at dusk and clambered up the granite ramparts of Golconda Fort overlooking the glittering tech capital.',
    highlights: ['Golconda Fort whispering gallery', 'Charminar heritage bazaars', 'Warangal Thousand Pillar temple'],
    memorableEncounter: 'An Irani chai cafe owner near Charminar who shared stories of Hyderabad’s old nawabi culture over Osmania biscuits.',
    localFood: 'Hyderabadi Dum Biryani, Irani Chai with Osmania biscuits, & Mirchi ka Salan',
    coordinates: { x: 44, y: 60 }
  },
  {
    id: 'state-26',
    stateNumber: 26,
    name: 'Andhra Pradesh',
    capital: 'Amaravati',
    week: 26,
    distanceKm: 115,
    region: 'South',
    coverImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'Grand Canyon of India at Gandikota, carved by the mighty Penna river across red granite.',
    storySnippet: 'Camped on the edge of the Gandikota gorge under an ocean of stars. Visited the hanging pillar of Lepakshi temple where a thin paper passes beneath solid granite.',
    highlights: ['Gandikota Red Gorge', 'Lepakshi hanging monolithic pillar', 'Araku Valley coffee plantations'],
    memorableEncounter: 'A priest at Lepakshi who pointed out the giant monolithic Nandi carved from a single boulder.',
    localFood: 'Andhra Gongura Mamsam, Pesarattu with ginger pachadi & spicy Royyala Iguru',
    coordinates: { x: 44, y: 68 }
  },
  {
    id: 'state-27',
    stateNumber: 27,
    name: 'Tamil Nadu',
    capital: 'Chennai',
    week: 27,
    distanceKm: 155,
    region: 'South',
    coverImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80'
    ],
    quote: 'Gopurams soaring into sapphire skies, fragrant with jasmine, camphor, and ancient bronze devotion.',
    storySnippet: 'Crossed the Pamban rail bridge cantilevered over turquoise ocean to reach the ghost city of Dhanushkodi at the tip of India where the two seas meet.',
    highlights: ['Dhanushkodi ghost town beach', 'Madurai Meenakshi temple halls', 'Mahabalipuram rock-cut shore temples'],
    memorableEncounter: 'A fisherman in Rameshwaram who took me on his wooden catamaran into the shallow strait where Sri Lanka’s horizon begins.',
    localFood: 'Chettinad Pepper Chicken, filter coffee in brass dabarah, & fluffy Idlis on plantain leaf',
    coordinates: { x: 40, y: 80 }
  },
  {
    id: 'state-28',
    stateNumber: 28,
    name: 'Kerala',
    capital: 'Thiruvananthapuram',
    week: 28,
    distanceKm: 110,
    region: 'South',
    coverImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80'
    ],
    quote: '28 weeks completed. My shoes are torn, my skin is sun-baked, but my heart is fuller than words can hold.',
    storySnippet: 'Standing at Kanyakumari cape where the Arabian Sea, the Bay of Bengal, and the Indian Ocean embrace. The final sunset of the 28-week solo odyssey.',
    highlights: ['Alleppey backwater canoes', 'Munnar high tea clouds', 'Kanyakumari tri-sea confluence'],
    memorableEncounter: 'A homestay family in Kumarakom who celebrated my journey’s completion with a grand 24-dish Onam Sadhya.',
    localFood: 'Kerala Parotta with beef fry, Appam with stew, & Karimeen Pollichathu',
    coordinates: { x: 36, y: 84 }
  }
];
