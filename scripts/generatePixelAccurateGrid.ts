import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

interface DetectedTile {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  pixelCount: number;
}

interface MosaicCellOutput {
  cellId: string;
  x: number;
  y: number;
  pixelX: number;
  pixelY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  leftPercent: number;
  topPercent: number;
  widthPercent: number;
  heightPercent: number;
  valid: boolean;
  isBlackTile: boolean;
  region: 'north' | 'south' | 'west' | 'east' | 'central' | 'northeast' | 'islands';
  stateName: string;
  cityName: string;
}

export function resolveGeographicStateAndRegion(col: number, row: number, centerX: number, centerY: number): {
  stateName: string;
  cityName: string;
  region: 'north' | 'south' | 'west' | 'east' | 'central' | 'northeast' | 'islands';
} {
  // 1. Lakshadweep (Arabian Sea, cols <= 8, rows >= 38)
  if (col <= 8 && row >= 38) {
    if (row >= 44) {
      return { stateName: 'Lakshadweep', cityName: 'Minicoy Island', region: 'islands' };
    }
    return { stateName: 'Lakshadweep', cityName: 'Kavaratti / Agatti / Chetlat', region: 'islands' };
  }

  // 2. Andaman & Nicobar (Bay of Bengal, cols >= 33, rows >= 36)
  if (col >= 33 && row >= 36) {
    if (row >= 46) {
      return { stateName: 'Andaman and Nicobar Islands', cityName: 'Indira Point (Southernmost Tip)', region: 'islands' };
    }
    if (row >= 44) {
      return { stateName: 'Andaman and Nicobar Islands', cityName: 'Great Nicobar / Campbell Bay', region: 'islands' };
    }
    if (row >= 42) {
      return { stateName: 'Andaman and Nicobar Islands', cityName: 'Car Nicobar / Nancowry', region: 'islands' };
    }
    if (row >= 40) {
      return { stateName: 'Andaman and Nicobar Islands', cityName: 'Little Andaman / Hut Bay', region: 'islands' };
    }
    if (row >= 38) {
      return { stateName: 'Andaman and Nicobar Islands', cityName: 'Port Blair / Havelock / Neil Island', region: 'islands' };
    }
    return { stateName: 'Andaman and Nicobar Islands', cityName: 'North & Middle Andaman (Diglipur / Mayabunder)', region: 'islands' };
  }

  // 3. North Crown (Rows 0 - 6): Ladakh & Jammu & Kashmir
  if (row <= 1) {
    if (col >= 10) return { stateName: 'Ladakh', cityName: 'Siachen / Karakoram / Nubra Valley', region: 'north' };
    return { stateName: 'Jammu & Kashmir', cityName: 'Gilgit / Kupwara / Baramulla', region: 'north' };
  }
  if (row <= 4) {
    if (col >= 13) return { stateName: 'Ladakh', cityName: 'Leh / Nubra / Changthang / Pangong Tso', region: 'north' };
    return { stateName: 'Jammu & Kashmir', cityName: 'Srinagar / Gulmarg / Anantnag / Pahalgam', region: 'north' };
  }
  if (row <= 6) {
    if (col >= 13) return { stateName: 'Ladakh', cityName: 'Zanskar / Kargil / Hanle', region: 'north' };
    if (col >= 11) return { stateName: 'Himachal Pradesh', cityName: 'Lahaul & Spiti / Chamba / Rohtang', region: 'north' };
    return { stateName: 'Jammu & Kashmir', cityName: 'Jammu / Udhampur / Kathua / Rajouri', region: 'north' };
  }

  // 4. Himachal Pradesh, Punjab, Uttarakhand (Rows 7 - 10)
  if (row <= 10) {
    if (col <= 10) {
      if (row >= 9) return { stateName: 'Punjab', cityName: 'Ludhiana / Patiala / Bathinda / Jalandhar', region: 'north' };
      return { stateName: 'Punjab', cityName: 'Amritsar / Gurdaspur / Pathankot / Jalandhar', region: 'north' };
    }
    if (col <= 13) {
      if (row === 10) return { stateName: 'Haryana', cityName: 'Ambala / Kurukshetra / Karnal / Panipat', region: 'north' };
      return { stateName: 'Himachal Pradesh', cityName: 'Shimla / Kullu / Manali / Kangra / Dharamshala / Mandi', region: 'north' };
    }
    return { stateName: 'Uttarakhand', cityName: 'Dehradun / Rishikesh / Haridwar / Nainital / Mussoorie / Chamoli', region: 'north' };
  }

  // 5. Northeast Spur (Cols >= 27, Rows 11 - 24)
  if (col >= 27 && row >= 11 && row <= 24) {
    if (col >= 35) {
      if (row <= 13) return { stateName: 'Arunachal Pradesh', cityName: 'Upper Siang / Dibang Valley / Pasighat', region: 'northeast' };
      if (row <= 15) return { stateName: 'Arunachal Pradesh', cityName: 'Lohit / Anjaw / Changlang / Tawang', region: 'northeast' };
      if (row <= 18) return { stateName: 'Nagaland', cityName: 'Kohima / Dimapur / Mon / Mokokchung', region: 'northeast' };
      if (row <= 20) return { stateName: 'Manipur', cityName: 'Imphal / Ukhrul / Churachandpur', region: 'northeast' };
      return { stateName: 'Mizoram', cityName: 'Aizawl / Champhai / Lunglei', region: 'northeast' };
    }
    if (col >= 32) {
      if (row <= 14) return { stateName: 'Arunachal Pradesh', cityName: 'Itanagar / Pasighat / Ziro / Tawang', region: 'northeast' };
      if (row <= 16) return { stateName: 'Assam', cityName: 'Dibrugarh / Tinsukia / Jorhat / Sivasagar', region: 'northeast' };
      if (row <= 19) return { stateName: 'Assam', cityName: 'Tezpur / Nagaon / Golaghat / Kaziranga', region: 'northeast' };
      if (row <= 23) return { stateName: 'Tripura', cityName: 'Agartala / Unakoti / Dharmanagar / Udaipur', region: 'northeast' };
      return { stateName: 'Mizoram', cityName: 'Lunglei / Lawngtlai', region: 'northeast' };
    }
    if (col >= 29) {
      if (row <= 15) return { stateName: 'Assam', cityName: 'Guwahati / Kamrup / Barpeta / Dispur', region: 'northeast' };
      if (row <= 18) return { stateName: 'Meghalaya', cityName: 'Shillong / Cherrapunji / Tura / Dawki', region: 'northeast' };
      return { stateName: 'Tripura', cityName: 'Agartala / Gomati / South Tripura', region: 'northeast' };
    }
    if (col >= 27) {
      if (row <= 15) return { stateName: 'Sikkim', cityName: 'Gangtok / Namchi / Pelling / Nathula', region: 'northeast' };
      if (row <= 17) return { stateName: 'West Bengal', cityName: 'Darjeeling / Siliguri / Kalimpong / Jalpaiguri', region: 'east' };
      return { stateName: 'West Bengal', cityName: 'Cooch Behar / Alipurduar / Dooars', region: 'east' };
    }
  }

  // 6. Northern Plains & Gangetic Belt (Rows 11 - 14)
  if (row <= 14) {
    if (col <= 7) return { stateName: 'Rajasthan', cityName: 'Sri Ganganagar / Hanumangarh / Bikaner / Churu', region: 'west' };
    if (col <= 10) return { stateName: 'Haryana', cityName: 'Hisar / Rohtak / Bhiwani / Gurugram / Faridabad', region: 'north' };
    if (col <= 12) return { stateName: 'Delhi', cityName: 'New Delhi / Delhi NCR / Central Delhi / South Delhi', region: 'north' };
    if (col <= 15) return { stateName: 'Uttar Pradesh', cityName: 'Agra / Mathura / Aligarh / Meerut / Moradabad / Bareilly', region: 'north' };
    return { stateName: 'Uttar Pradesh', cityName: 'Lucknow / Ayodhya / Kanpur / Gorakhpur / Prayagraj', region: 'north' };
  }

  // 7. Rajasthan, UP East, Bihar, MP North (Rows 15 - 16)
  if (row <= 16) {
    if (col <= 5) return { stateName: 'Rajasthan', cityName: 'Jaisalmer / Barmer / Thar Desert', region: 'west' };
    if (col <= 8) return { stateName: 'Rajasthan', cityName: 'Jodhpur / Jaipur / Ajmer / Pali / Sikar', region: 'west' };
    if (col <= 11) return { stateName: 'Rajasthan', cityName: 'Kota / Bundi / Udaipur / Bhilwara / Chittorgarh / Sawai Madhopur', region: 'west' };
    if (col <= 14) return { stateName: 'Madhya Pradesh', cityName: 'Gwalior / Morena / Bhind / Datia / Shivpuri', region: 'central' };
    if (col <= 18) return { stateName: 'Uttar Pradesh', cityName: 'Jhansi / Kanpur / Prayagraj / Varanasi / Ayodhya', region: 'north' };
    if (col <= 23) return { stateName: 'Bihar', cityName: 'Patna / Gaya / Muzaffarpur / Bhagalpur / Darbhanga / Nalanda', region: 'east' };
    return { stateName: 'West Bengal', cityName: 'Malda / Murshidabad / Siliguri', region: 'east' };
  }

  // 8. Gujarat North, MP Central, Jharkhand, West Bengal (Rows 17 - 19)
  if (row <= 19) {
    if (col <= 5) return { stateName: 'Gujarat', cityName: 'Kutch / Bhuj / Gandhidham / Mandvi', region: 'west' };
    if (col <= 8) return { stateName: 'Gujarat', cityName: 'Ahmedabad / Gandhinagar / Mehsana / Anand / Kheda', region: 'west' };
    if (col <= 12) return { stateName: 'Madhya Pradesh', cityName: 'Bhopal / Indore / Ujjain / Dewas / Ratlam', region: 'central' };
    if (col <= 16) return { stateName: 'Madhya Pradesh', cityName: 'Jabalpur / Sagar / Rewa / Satna / Katni / Pachmarhi', region: 'central' };
    if (col <= 20) return { stateName: 'Chhattisgarh', cityName: 'Raipur / Bilaspur / Durg / Bhilai / Korba', region: 'central' };
    if (col <= 23) return { stateName: 'Jharkhand', cityName: 'Ranchi / Jamshedpur / Dhanbad / Bokaro / Hazaribagh', region: 'east' };
    return { stateName: 'West Bengal', cityName: 'Kolkata / Howrah / Durgapur / Asansol / Sundarbans / Digha', region: 'east' };
  }

  // 9. Gujarat Saurashtra & South, Maharashtra North & Vidarbha, Odisha (Rows 20 - 23)
  if (row <= 23) {
    if (col <= 5) {
      if (row >= 22) return { stateName: 'Gujarat', cityName: 'Gir Somnath / Veraval / Diu / Junagadh / Porbandar', region: 'west' };
      return { stateName: 'Gujarat', cityName: 'Saurashtra / Rajkot / Jamnagar / Dwarka / Bhavnagar / Morbi', region: 'west' };
    }
    if (col <= 8) {
      if (row >= 23) return { stateName: 'Maharashtra', cityName: 'Palghar / Vasai / Dahanu / Northern MMR', region: 'west' };
      return { stateName: 'Gujarat', cityName: 'Surat / Vadodara / Bharuch / Navsari / Valsad / Vapi', region: 'west' };
    }
    if (col <= 11) return { stateName: 'Maharashtra', cityName: 'Nashik / Dhule / Jalgaon / Aurangabad (Chhatrapati Sambhajinagar)', region: 'west' };
    if (col <= 16) return { stateName: 'Maharashtra', cityName: 'Nagpur / Amravati / Chandrapur / Akola / Wardha / Nanded', region: 'west' };
    if (col <= 20) return { stateName: 'Chhattisgarh', cityName: 'Bastar / Jagdalpur / Rajnandgaon', region: 'central' };
    return { stateName: 'Odisha', cityName: 'Bhubaneswar / Cuttack / Puri / Rourkela / Berhampur / Sambalpur', region: 'east' };
  }

  // 10. Maharashtra (Mumbai MMR, Thane, Pune, Satara, Ahmednagar) / Telangana / Andhra Pradesh (Rows 24 - 26)
  if (row <= 26) {
    if (col <= 5) return { stateName: 'Gujarat', cityName: 'Gulf of Khambhat / Diu / Gir Somnath Coast', region: 'west' };
    if (col <= 8) {
      if (row === 24) return { stateName: 'Maharashtra', cityName: 'Mumbai / Thane / Palghar / Navi Mumbai', region: 'west' };
      if (row === 25) return { stateName: 'Maharashtra', cityName: 'Mumbai / South Mumbai / Bandra / Andheri / Navi Mumbai', region: 'west' };
      return { stateName: 'Maharashtra', cityName: 'Mumbai / Navi Mumbai / Raigad / Alibaug / Lonavala', region: 'west' };
    }
    if (col <= 11) return { stateName: 'Maharashtra', cityName: 'Pune / Satara / Solapur / Ahmednagar / PCMC', region: 'west' };
    if (col <= 15) return { stateName: 'Maharashtra', cityName: 'Kolhapur / Sangli / Latur / Osmanabad (Dharashiv) / Nanded', region: 'west' };
    if (col <= 19) return { stateName: 'Telangana', cityName: 'Hyderabad / Secunderabad / Warangal / Nizamabad / Karimnagar', region: 'south' };
    return { stateName: 'Andhra Pradesh', cityName: 'Visakhapatnam / Vijayawada / Guntur / Kakinada / Rajahmundry', region: 'south' };
  }

  // 11. Maharashtra (Pune/Konkan Coast/Ratnagiri), Karnataka North, Telangana South, Andhra Pradesh (Rows 27 - 28)
  if (row <= 28) {
    if (col <= 8) {
      if (row === 27) return { stateName: 'Maharashtra', cityName: 'Pune / Raigad / Mahabaleshwar / Lavasa / Konkan Coast', region: 'west' };
      return { stateName: 'Maharashtra', cityName: 'Ratnagiri / Chiplun / Dapoli / Western Maharashtra Coast', region: 'west' };
    }
    if (col <= 11) return { stateName: 'Maharashtra', cityName: 'Kolhapur / Sangli / Satara / Solapur', region: 'west' };
    if (col <= 14) return { stateName: 'Karnataka', cityName: 'Belagavi (Belgaum) / Hubballi / Dharwad / Bagalkot / Vijayapura', region: 'south' };
    if (col <= 18) return { stateName: 'Telangana', cityName: 'Mahabubnagar / Khammam / Nalgonda', region: 'south' };
    return { stateName: 'Andhra Pradesh', cityName: 'Kurnool / Kadapa / Nellore / Anantapur / Tirupati', region: 'south' };
  }

  // 12. Maharashtra South Konkan (Sindhudurg), Karnataka North/Central, Andhra Pradesh South (Rows 29 - 30)
  if (row <= 30) {
    if (col <= 8) return { stateName: 'Maharashtra', cityName: 'Sindhudurg / Malvan / Vengurla / Sawantwadi (Konkan Coast)', region: 'west' };
    if (col <= 11) return { stateName: 'Karnataka', cityName: 'Belagavi / Hubballi-Dharwad / Ballari / Davanagere / Bagalkot', region: 'south' };
    if (col <= 15) return { stateName: 'Karnataka', cityName: 'Kalaburagi (Gulbarga) / Raichur / Shivamogga / Chitradurga', region: 'south' };
    if (col <= 18) return { stateName: 'Andhra Pradesh', cityName: 'Kurnool / Anantapur / Kadapa / Rayalaseema', region: 'south' };
    return { stateName: 'Andhra Pradesh', cityName: 'Nellore / Tirupati / Prakasam / Sri City', region: 'south' };
  }

  // 13. Goa, Karnataka Central & South (Bengaluru!), Tamil Nadu North (Chennai!) (Rows 31 - 33)
  if (row <= 33) {
    if (col <= 8) return { stateName: 'Goa', cityName: 'Panaji / Margao / Vasco da Gama / Mapusa / Calangute (Goa)', region: 'south' };
    if (col <= 11) return { stateName: 'Karnataka', cityName: 'Shivamogga (Shimoga) / Chikkamagaluru / Hassan / Mandya / Tumakuru', region: 'south' };
    if (col <= 15) return { stateName: 'Karnataka', cityName: 'Bengaluru (Bangalore) / Bangalore Urban & Rural / Ramanagara / Kolar', region: 'south' };
    if (col <= 17) return { stateName: 'Andhra Pradesh', cityName: 'Tirupati / Chittoor / Rayalaseema', region: 'south' };
    return { stateName: 'Tamil Nadu', cityName: 'Chennai / Kanchipuram / Tiruvallur / Vellore / Chengalpattu', region: 'south' };
  }

  // 14. Karnataka Coastal (Karwar/Gokarna/Udupi/Mangaluru), Mysuru, Tamil Nadu Central (Rows 34 - 36)
  if (row <= 36) {
    if (col <= 9) return { stateName: 'Karnataka', cityName: 'Karwar / Gokarna / Murudeshwar / Udupi / Mangaluru (Mangalore) / Manipal', region: 'south' };
    if (col <= 12) return { stateName: 'Karnataka', cityName: 'Mysuru (Mysore) / Kodagu (Coorg) / Chamarajanagar / Hassan', region: 'south' };
    if (col <= 15) return { stateName: 'Tamil Nadu', cityName: 'Coimbatore / Nilgiris (Ooty) / Salem / Erode / Tiruppur', region: 'south' };
    return { stateName: 'Tamil Nadu', cityName: 'Tiruchirappalli (Trichy) / Thanjavur / Pudukkottai / Cuddalore / Puducherry', region: 'south' };
  }

  // 15. Kerala North & Central, Tamil Nadu South (Rows 37 - 40)
  if (row <= 40) {
    if (col <= 11) {
      if (row <= 38) return { stateName: 'Kerala', cityName: 'Kozhikode (Calicut) / Kannur / Kasaragod / Wayanad / Malappuram', region: 'south' };
      return { stateName: 'Kerala', cityName: 'Kochi (Cochin) / Thrissur / Ernakulam / Alappuzha (Alleppey) / Kottayam / Idukki', region: 'south' };
    }
    if (col <= 14) return { stateName: 'Tamil Nadu', cityName: 'Madurai / Dindigul / Theni / Virudhunagar / Sivaganga', region: 'south' };
    if (col <= 16) return { stateName: 'Tamil Nadu', cityName: 'Tirunelveli / Thoothukudi (Tuticorin) / Tenkasi', region: 'south' };
    return { stateName: 'Tamil Nadu', cityName: 'Ramanathapuram / Rameswaram / Dhanushkodi', region: 'south' };
  }

  // 16. Kerala South, Tamil Nadu South (Rows 41 - 43)
  if (row <= 43) {
    if (col <= 12) return { stateName: 'Kerala', cityName: 'Thiruvananthapuram (Trivandrum) / Kollam / Kovalam / Varkala / Poovar', region: 'south' };
    if (col <= 15) return { stateName: 'Tamil Nadu', cityName: 'Tirunelveli / Thoothukudi / Tenkasi / Virudhunagar', region: 'south' };
    return { stateName: 'Tamil Nadu', cityName: 'Ramanathapuram / Rameswaram / Gulf of Mannar', region: 'south' };
  }

  // 17. Rows 44 - 46 (Kanyakumari / Cape Comorin Southernmost Tip)
  if (col <= 12) return { stateName: 'Kerala', cityName: 'Poovar / Neyyattinkara / South Kerala Coast', region: 'south' };
  return { stateName: 'Tamil Nadu', cityName: 'Kanyakumari / Nagercoil / Cape Comorin (Southernmost Tip & Rock Memorial)', region: 'south' };
}

async function run() {
  const imagePath = path.join(process.cwd(), 'public/assets/mosaic_map-1.jpg');
  const { data, info } = await sharp(imagePath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  const binary = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * ch;
      const brightness = (data[idx] + data[idx+1] + data[idx+2]) / 3;
      if (brightness < 35) binary[y * w + x] = 1;
    }
  }

  const visited = new Uint8Array(w * h);
  const components: DetectedTile[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (binary[y * w + x] === 1 && !visited[y * w + x]) {
        let minX = x, maxX = x, minY = y, maxY = y;
        let count = 0;
        const queue = [x, y];
        visited[y * w + x] = 1;
        let qHead = 0;
        while (qHead < queue.length) {
          const cx = queue[qHead++];
          const cy = queue[qHead++];
          count++;
          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;
          const neighbors = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nidx = ny * w + nx;
              if (binary[nidx] === 1 && !visited[nidx]) {
                visited[nidx] = 1;
                queue.push(nx, ny);
              }
            }
          }
        }
        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        if (width >= 8 && width <= 40 && height >= 8 && height <= 40 && count >= 50) {
          components.push({
            minX, maxX, minY, maxY,
            width, height,
            centerX: (minX + maxX) / 2,
            centerY: (minY + maxY) / 2,
            pixelCount: count
          });
        }
      }
    }
  }

  console.log(`Detected ${components.length} individual black tiles from mosaic_map-1.jpg`);

  const PITCH_X = 26.23;
  const ORIGIN_X = 285.8;
  const PITCH_Y = 26.46;
  const ORIGIN_Y = 40.2;

  const cells: MosaicCellOutput[] = components.map(c => {
    const col = Math.round((c.centerX - ORIGIN_X) / PITCH_X);
    const row = Math.round((c.centerY - ORIGIN_Y) / PITCH_Y);

    const { stateName, cityName, region } = resolveGeographicStateAndRegion(col, row, c.centerX, c.centerY);

    const leftPercent = Number(((c.minX / w) * 100).toFixed(4));
    const topPercent = Number(((c.minY / h) * 100).toFixed(4));
    const widthPercent = Number(((c.width / w) * 100).toFixed(4));
    const heightPercent = Number(((c.height / h) * 100).toFixed(4));

    return {
      cellId: `cell-${row}-${col}`,
      x: col,
      y: row,
      pixelX: c.minX,
      pixelY: c.minY,
      width: c.width,
      height: c.height,
      centerX: Number(c.centerX.toFixed(1)),
      centerY: Number(c.centerY.toFixed(1)),
      leftPercent,
      topPercent,
      widthPercent,
      heightPercent,
      valid: true,
      isBlackTile: true,
      region,
      stateName,
      cityName
    };
  });

  cells.sort((a, b) => a.y - b.y || a.x - b.x);

  const minCol = Math.min(...cells.map(c => c.x));
  const maxCol = Math.max(...cells.map(c => c.x));
  const minRow = Math.min(...cells.map(c => c.y));
  const maxRow = Math.max(...cells.map(c => c.y));

  const output = {
    width: w,
    height: h,
    cols: maxCol - minCol + 1,
    rows: maxRow - minRow + 1,
    minCol,
    maxCol,
    minRow,
    maxRow,
    pitchX: PITCH_X,
    pitchY: PITCH_Y,
    originX: ORIGIN_X,
    originY: ORIGIN_Y,
    totalCells: cells.length,
    description: "Exact 674-cell pixel-calibrated India Mosaic matrix matching mosaic_map-1.jpg",
    cells
  };

  const outputPath = path.join(process.cwd(), 'src/data/india_grid_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Saved ${cells.length} cells to ${outputPath}`);

  const mosaicCellsPath = path.join(process.cwd(), 'src/data/mosaic-cells.json');
  fs.writeFileSync(mosaicCellsPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Saved ${cells.length} cells to ${mosaicCellsPath}`);
}

run().catch(console.error);
