const mongoose = require('mongoose');

async function checkDb() {
  await mongoose.connect('mongodb+srv://harivelmani_db_user:2bEscjo3ns7aGyre@cluster0.gg2ejfh.mongodb.net/skillfolio?retryWrites=true&w=majority');
  
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Profile = mongoose.model('Profile', new mongoose.Schema({}, { strict: false }));

  const users = await User.find({});
  console.log("Users:", JSON.stringify(users, null, 2));

  const profiles = await Profile.find({});
  console.log("Profiles:", JSON.stringify(profiles, null, 2));

  mongoose.disconnect();
}

checkDb();
