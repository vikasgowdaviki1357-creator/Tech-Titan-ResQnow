const SERVICES = [
  { id:1, name:"City Emergency Response Unit", category:"emergency", icon:"🚨", type:"Emergency Services", phone:"112", address:"MG Road, Sector 1", lat:12.9716, lng:77.5946, distKm:0.8, status:"open", rating:4.9, available:true, eta:"3 min" },
  { id:2, name:"Apollo Hospital", category:"medical", icon:"🏥", type:"Multi-Specialty Hospital", phone:"18605002244", address:"Bannerghatta Road", lat:12.9006, lng:77.5970, distKm:1.2, status:"open", rating:4.8, available:true, eta:"5 min" },
  { id:3, name:"Fortis Hospital", category:"medical", icon:"🏥", type:"Emergency & Trauma", phone:"18605006789", address:"Cunningham Road", lat:12.9892, lng:77.5855, distKm:2.1, status:"open", rating:4.7, available:true, eta:"8 min" },
  { id:4, name:"Manipal Hospital", category:"medical", icon:"🏥", type:"Super-Specialty", phone:"08022344444", address:"HAL Airport Road", lat:12.9584, lng:77.6464, distKm:3.4, status:"busy", rating:4.6, available:false, eta:"12 min" },
  { id:5, name:"St. John's Medical Center", category:"medical", icon:"🏥", type:"Government Hospital", phone:"08022065000", address:"Koramangala", lat:12.9334, lng:77.6110, distKm:4.1, status:"open", rating:4.5, available:true, eta:"14 min" },
  { id:6, name:"LifeLine Ambulance Service", category:"medical", icon:"🚑", type:"Private Ambulance", phone:"08041124466", address:"Jayanagar 4th Block", lat:12.9299, lng:77.5878, distKm:1.7, status:"open", rating:4.7, available:true, eta:"6 min" },
  { id:7, name:"Shivajinagar Fire Station", category:"fire", icon:"🔥", type:"Fire & Rescue", phone:"101", address:"Shivajinagar", lat:12.9850, lng:77.6001, distKm:1.5, status:"open", rating:4.9, available:true, eta:"4 min" },
  { id:8, name:"Indiranagar Fire Station", category:"fire", icon:"🔥", type:"Fire Brigade", phone:"101", address:"Indiranagar 100ft Road", lat:12.9784, lng:77.6408, distKm:2.8, status:"open", rating:4.8, available:true, eta:"9 min" },
  { id:9, name:"MG Road Police Station", category:"police", icon:"🚔", type:"Police Station", phone:"100", address:"MG Road, Central Bangalore", lat:12.9752, lng:77.6085, distKm:0.6, status:"open", rating:4.5, available:true, eta:"3 min" },
  { id:10, name:"Koramangala Police Station", category:"police", icon:"🚔", type:"Police Station", phone:"08025509999", address:"Koramangala 6th Block", lat:12.9352, lng:77.6245, distKm:3.9, status:"open", rating:4.3, available:true, eta:"13 min" },
  { id:11, name:"Indiranagar Police Post", category:"police", icon:"🚔", type:"Police Outpost", phone:"08025255555", address:"100ft Road, Indiranagar", lat:12.9716, lng:77.6412, distKm:2.2, status:"open", rating:4.4, available:true, eta:"8 min" },
  { id:12, name:"SpeedFix Auto Workshop", category:"mechanic", icon:"🔧", type:"Auto Mechanic", phone:"09845012345", address:"Old Airport Road", lat:12.9560, lng:77.6345, distKm:1.1, status:"open", rating:4.6, available:true, eta:"On-call" },
  { id:13, name:"RoadAssist 24x7", category:"mechanic", icon:"🔧", type:"Roadside Assistance", phone:"18001234567", address:"Whitefield Main Road", lat:12.9698, lng:77.7499, distKm:2.4, status:"open", rating:4.8, available:true, eta:"On-call" },
  { id:14, name:"QuickTyre Services", category:"mechanic", icon:"🛞", type:"Tyre & Battery", phone:"09900987654", address:"Domlur Flyover", lat:12.9609, lng:77.6387, distKm:1.9, status:"busy", rating:4.3, available:false, eta:"On-call" },
  { id:15, name:"PowerFix Electricians", category:"electric", icon:"⚡", type:"Emergency Electrician", phone:"09876543210", address:"Jayanagar 9th Block", lat:12.9196, lng:77.5831, distKm:1.4, status:"open", rating:4.7, available:true, eta:"On-call" },
  { id:16, name:"BrightSpark Solutions", category:"electric", icon:"⚡", type:"Residential & Commercial", phone:"08041567890", address:"HSR Layout Sector 7", lat:12.9121, lng:77.6446, distKm:3.2, status:"open", rating:4.5, available:true, eta:"On-call" },
  { id:17, name:"VoltCare 24/7", category:"electric", icon:"⚡", type:"24/7 Emergency Electrical", phone:"09988776655", address:"Marathahalli Bridge", lat:12.9561, lng:77.7004, distKm:4.6, status:"open", rating:4.9, available:true, eta:"On-call" },
  { id:18, name:"AquaFix Plumbing", category:"plumber", icon:"🔩", type:"Emergency Plumbing", phone:"09745123456", address:"BTM Layout 2nd Stage", lat:12.9166, lng:77.6101, distKm:2.7, status:"open", rating:4.6, available:true, eta:"On-call" },
  { id:19, name:"PipeRight Services", category:"plumber", icon:"🔩", type:"Drainage & Pipe Repair", phone:"09123456789", address:"Electronic City Phase 1", lat:12.8458, lng:77.6603, distKm:5.1, status:"open", rating:4.4, available:true, eta:"On-call" },
  { id:20, name:"FlowMaster Plumbers", category:"plumber", icon:"🔩", type:"24H Emergency Plumbing", phone:"08044556677", address:"Vijayanagar Main Road", lat:12.9715, lng:77.5261, distKm:3.8, status:"busy", rating:4.2, available:false, eta:"On-call" },
];

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };

const CATEGORY_COLORS = {
  emergency: '#FF1E1E', medical: '#00B0FF', fire: '#FF6D00',
  police: '#1565C0', mechanic: '#FFD600', electric: '#AEEA00', plumber: '#00E5FF',
};