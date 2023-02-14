const Schema = {
	users: {
  id: {type: "increments", nullable: false, primary: true},		
  name: {type:"string",   nullable: true},
  username: {type:"string",   nullable: true},
  email: {type:"string", nullable: true},
  address: {type:"string",  nullable: true},
  password: {type: "string", nullable: true},
  mobile: {type:"string", nullable: true},
  govt_id:{type: "string", nullable: true},
  govt_id_exp_date: {type: "dateTime", nullable: true},
  govt_id_image_url_front: {type:"string", nullable: true},
  govt_id_image_url_back: {type:"string", nullable: true},
  profile_image_url: {type:"string", nullable: true},
  twitter: {type: "string", nullable: true},
  facebook: {type: "string", nullable: true},
  is_user_active: {type: "tinyint", nullable: false, defaultTo: 0},
  rating: {type: "float", nullable: false, defaultTo: 0},
  country_code: {type: "string", nullable: true},
  country_name: {type: "string", nullable: true},
  role:{type: "string", nullable: false, defaultTo: 'user'},
  created_at: {type: "dateTime", nullable: false},
  updated_at: {type: "dateTime", nullable: true}
	},
	
	roles:{
		id: {type: "increments", nullable: false, primary: true},
		role: {type: "string", nullable: true}		
  },
  
  user_verifications:{

     id: {type: "increments", nullable: false, primary: true},
     otp_code: {type: "string", nullable: true},		
     expired_date: {type: "dateTime", nullable: true},
     user_id: {type: "integer", require:true, foreign: true },
     mobile: {type:"string", nullable: true},
     email: {type:"string", nullable: true},
     valid:  {type: "tinyint", nullable: true, defaultTo: 1},
     request_id:  {type: "integer", nullable: true},
     created_at: {type: "dateTime", nullable: false},
     updated_at: {type: "dateTime", nullable: true}
  },

  weight_details:{
    id: {type: "increments", nullable: false, primary: true},
    weight: {type: "string", nullable: true},
    weight_description: {type: "string", nullable: true}
  },

  container_details:{
    id: {type: "increments", nullable: false, primary: true},
    container_name: {type: "string", nullable: true}
  },

  label:{
    id: {type: "increments", nullable: false, primary: true},
    label: {type: "string", nullable: true}
  },
  
  shipment_details: {
    id: {type: "increments", nullable: false, primary: true},
    user_id: {type: "integer", require:true, foreign: true },
    shipment_name: {type: "string", nullable: true},
    shipment_value: {type:"integer", nullable: true},
    pick_up_location: {type: "string", nullable: true},
    pick_up_lat: {type:"string", maxlength: 250,nullable: true},
    pick_up_lon: {type:"string", maxlength: 250,nullable: true},
    drop_off_location: {type: "string", nullable: true},
    drop_off_lat: {type:"string", maxlength: 250, nullable: true},
    drop_off_lon: {type:"string", maxlength:250,  nullable: true},
    pick_up_date: {type: "dateTime", nullable: true},
    pick_up_time: {type: "string", nullable: true},
    total_pieces: {type: "integer", nullable: true},
    total_weight: {type: "string", nullable: true},
    weight_details_id: {type: "integer", require:true, foreign: true },
    total_container: {type: "integer", nullable: true},
    drop_off_date: {type: "dateTime", nullable: true},
    any_time: { type: "tinyint", nullable: false, defaultTo: 0 },
    negotiable: {type: "tinyint", nullable: false, defaultTo: 0},
    extra_charge: {type:"integer", nullable: true},
    receiver_id:  {type: "integer", require:true, foreign: true, defaultTo: 0 },
    locked: {type: "tinyint", nullable: false, defaultTo: 0},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  receiver_details: {
    id: {type: "increments", nullable: false, primary: true},
    user_id: {type: "integer", require:true, foreign: true },
    shipment_details_id: {type: "integer", require:true, foreign: true },
    recipient_name: {type: "string", nullable: true},
    recipient_phone: {type:"bigint", nullable: true},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },
  

  package_details: {
    id: {type: "increments", nullable: false, primary: true},
    user_id: {type: "integer", require:true, foreign: true },
    shipment_details_id: {type: "integer", require:true, foreign: true },
    package_image_url: {type: "string", nullable: true},
    package_image_name: {type: "string", nullable: true},
    dimension:{type: "string", nullable: true},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },
  
  container_size_details: {
    id: {type: "increments", nullable: false, primary: true},
    user_id: {type: "integer", require:true, foreign: true },
    shipment_details_id: {type: "integer", require:true, foreign: true },
    container_details_id: {type: "integer", nullable: true},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },
  
  package_document_details: {
    id: {type: "increments", nullable: false, primary: true},
    user_id: {type: "integer", require:true, foreign: true },
    shipment_details_id: {type: "integer", require:true, foreign: true },
    file_name: {type: "string", nullable: true},
    file_url: {type: "string", nullable: true},
    file_type: {type: "string", nullable: true},
    file_dimension: {type: "string", nullable: true},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  carrier_details: {
    id: {type: "increments", nullable: false, primary: true},
    user_id: {type: "integer", require:true, foreign: true },
    source_location: {type: "string", nullable: true},
    pick_up_lat: {type: "string", maxlength: 250, nullable: true},
    pick_up_lon: {type: "string", maxlength: 250, nullable: true},
    destination: {type: "string", nullable: true},
    drop_off_lat: {type: "string", maxlength: 250, nullable: true},
    drop_off_lon: {type: "string",maxlength: 250, nullable: true},
    time_of_pick_up: {type: "string", nullable: true},
    pick_up_date: {type: "dateTime", nullable: true},
    kg_to_carry: {type: "string", nullable: true},
    rate: {type: "string", maxlength: 250, nullable: true},
    extra_charge: {type: "string", maxlength: 250,nullable: true},
    total: {type: "string", maxlength: 250,nullable: true},
    locked: {type: "tinyint", nullable: false, defaultTo: 0},
    weight_details_id: {type: "integer", require:true, foreign: true },
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  status:{
    id: {type: "increments", nullable: false, primary: true},
    status: {type: "string", nullable: true},
  },

  terms:{
    id: {type: "increments", nullable: false, primary: true},
    name:{type: "string", nullable: true},
    url: {type: "string", nullable: true},
  },

  feedbacks:{
    id: {type: "increments", nullable: false, primary: true},
    reason: {type: "string", nullable: true},
    role_id: {type: "integer", require:true, foreign: true},
  },


  reject_list:{
    id: {type: "increments", nullable: false, primary: true},
    reason: {type: "string", nullable: true},
    role_id: {type: "integer", require:true, foreign: true},
  },

  commission:{
    id: {type: "increments", nullable: false, primary: true},
    country_id: {type: "integer", require:true, foreign: true},
    commission: {type: "float", nullable: true},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  requests:{
    id: {type: "increments", nullable: false, primary: true},
    sender_id: {type: "integer", nullable:true, foreign: true},
    carrier_id: {type: "integer", nullable: true, foreign: true},
    receiver_id: { type: "integer", nullable:true, foreign: true, defaultTo: 0 },
    carrier_details_id: {type: "integer", nullable:true, foreign: true},
    shipment_details_id: {type: "integer", nullable:true, foreign: true},
    status_id: {type: "integer", require:true, foreign: true},
    reason: {type: "string", nullable:true, foreign: true },
    comments: {type: "string", nullable:true},
    label: {type: "string", nullable:true},
    role_id: {type: "integer", require:true, foreign: true},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  tokens: {
   id: { type: "increments", nullable: false, primary: true },
   user_id: { type: "integer", require:true, foreign: true },
   token: { type: "string", nullable: true },
   isLogin : {type: "tinyint", nullable: false, defaultTo: 1},
   created_at: {type: "dateTime", nullable: false},
   updated_at: {type: "dateTime", nullable: true}
  },

  oauth_token: {
    id: { type: "increments", nullable: false, primary: true },
    user_id: { type: "integer", require:true, foreign: true },
    token: { type: "string", nullable: true },
    isLogin : {type: "tinyint", nullable: false, defaultTo: 1},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
   },

  notifications: {
    id : { type: "increments", nullable: false, primary: true },
    message: { type: "string", nullable: true },
    to_user_id: { type: "integer", nullable:true, foreign: true },
    user_id: { type: "integer", nullable:true, foreign: true },
    shipment_details_id: { type: "integer", nullable: true, foreign: true  },
    carrier_details_id: {type: "integer", nullable: true, foreign: true},
    request_id: { type: "integer", nullable:true, foreign: true },
    status: {type: "string", nullable: false, defaultTo: 'unread'},
    notification_type: { type: "integer", nullable:true, foreign: true },
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  ratings: {
    id : { type: "increments", nullable: false, primary: true },
    comments: { type: "string", nullable: true },
    report_from: { type: "integer", nullable: true , foreign: true },
    report_to: { type: "integer", nullable: true , foreign: true },
    promptness: { type: "float", defaultTo: 0},
    adherence_to_dates: { type: "float", defaultTo: 0},
    user_behaviour: { type: "float", defaultTo: 0 },
    parcel_contents_as_sent: { type: "float",defaultTo: 0 },
    average: { type: "float", defaultTo: 0},
    request_id: {type: "increments", nullable: false, primary: true},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  feedback_reports: {
    id : { type: "increments", nullable: false, primary: true },
    comments: { type: "string", nullable: true },
    report_from: { type: "integer", nullable: true , foreign: true },
    report_to: { type: "integer", nullable: true , foreign: true },
    feedback_id: {type: "integer", nullable: true , foreign: true },
    shipment_id: {type: "integer", nullable: true , foreign: true },
    request_id: {type: "integer", nullable: true , foreign: true },
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  faqs: {
    id : { type: "increments", nullable: false, primary: true },
    question: { type: "string", maxlength: 1000, nullable: true },
    answer: { type: "string", maxlength: 1500, nullable: true },
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  about_us: {
    id : { type: "increments", nullable: false, primary: true },
    about: { type: "string", maxlength: 3000, nullable: true },
  },

  notification_type: {
    id : { type: "increments", nullable: false, primary: true },
    type: { type: "string", maxlength: 3000, nullable: true },
  },

  card_details: {
    id : { type: "increments", nullable: false, primary: true },
    user_id: { type: "integer", nullable:true, foreign: true },
    card_id: { type: "string", required: true},
    card_digit: {type: "bigint", required: true},
    card_type: {type: "string", required: true},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  location:{
    id: {type: "increments", nullable: false, primary: true},
    user_id: { type: "integer", nullable:true, foreign: true },
    carrier_lat: {type:"string", maxlength: 250,nullable: true},
    carrier_lon: {type:"string", maxlength: 250,nullable: true},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  country_codes: {
    id: {type: "increments", nullable: false, primary: true},
    country_code: {type:"string", maxlength: 250,nullable: true},
    country_code_three: {type:"string", maxlength: 250,nullable: true},
    country_dial_code: {type:"string", maxlength: 250,nullable: true},
    country_name: {type:"string", maxlength: 1000,nullable: true},
  },

  directional_content: {
    id: {type: "increments", nullable: false, primary: true},
    heading: {type:"string", nullable: false, defaultTo: "Additional Directions" },
    directional_content: {type:"string", maxlength: 5000,nullable: true},
    role_id: {type: "integer", require:true, foreign: true},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  rated: {
    id: {type: "increments", nullable: false, primary: true},
    request_id: {type:"integer", require:true, foreign: true },
    report_from: { type: "integer", nullable: true , foreign: true },
    sender_id: {type:"integer", require: false},
    carrier_id: {type: "integer", require: false },
    receiver_id: {type: "integer", require: false },
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

  transaction: {
    id: {type: "increments", nullable: false, primary: true},
    request_id: {type:"integer", require:true, foreign: true },
    shipment_details_id:  {type:"integer", require:true, foreign: true },
    sender_id: {type:"integer", require: false},
    carrier_id: {type: "integer", require: false },
    receiver_id: {type: "integer", require: false },
    commission_status: {type: "tinyint", nullable: false, defaultTo: 0},
    created_at: {type: "dateTime", nullable: false},
    updated_at: {type: "dateTime", nullable: true}
  },

};

module.exports = Schema;

