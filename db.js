import Sequelize from 'sequelize';
import Faker from 'faker';
import _ from 'lodash';

// const Conn = new Sequelize(
//   'relay',
//   'mysql',
//   'mysql',
//   {
//     dialect: 'mysql',
//     host: 'localhost'
//   }
// );
const Conn = new Sequelize('mysql://UserInvi:J8olr*12@122.182.26.50/livecenter');

const Person = Conn.define('person', {
  firstName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true
    }
  }
});
//MatchID, SportRadarID, TournamentID, PageTitle, DateOfMatch,
	// ResultCanceled, Winner, Sets, Set1, Set2, Set3, Set4, Set5,
	// Set6, Set7, NeutralGround, RoundInfoID, RoundName, MatchType,
	// FileName, RecordSource, ResultURL, IsActive, AddedOn, LastUpdatedOn,
	// isfinished, MatchTitle

const tennisMatches = Conn.define('sportradar_matchmasters', {
  MatchID: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  SportRadarID: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  TournamentID: {
    type: Sequelize.INTEGER
  },
  PageTitle: {
    type: Sequelize.STRING
  },
  DateOfMatch: {
    type: Sequelize.DATE
  },
  ResultCanceled: {
    type: Sequelize.STRING
  },
  Winner: {
    type: Sequelize.STRING
  },
  Sets: {
    type: Sequelize.STRING
  },
  Set1: {
    type: Sequelize.STRING
  },
  Set2: {
    type: Sequelize.STRING
  },
  Set3: {
    type: Sequelize.STRING
  },
  Set4: {
    type: Sequelize.STRING
  },
  Set5: {
    type: Sequelize.STRING
  },
  Set6: {
    type: Sequelize.STRING
  },
  Set7: {
    type: Sequelize.STRING
  },
  NeutralGround: {
    type: Sequelize.STRING
  },
  RoundInfoID: {
    type: Sequelize.INTEGER
  },
  RoundName: {
    type: Sequelize.STRING
  },
  MatchType: {
    type: Sequelize.STRING
  },
  FileName: {
    type: Sequelize.STRING
  },
  RecordSource: {
    type: Sequelize.STRING
  },
  ResultURL: {
    type: Sequelize.STRING
  },
  IsActive: {
    type: Sequelize.STRING
  },
  AddedOn: {
    type: Sequelize.DATE
  },
  LastUpdatedOn: {
    type: Sequelize.DATE
  },
  isfinished: {
    type: Sequelize.STRING
  },
  MatchTitle: {
    type: Sequelize.STRING
  }
});

const Post = Conn.define('post', {
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  content: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

// Relations
Person.hasMany(Post);
Post.belongsTo(Person);

// Conn.sync({ force: true }).then(()=> {
//   _.times(10, ()=> {
//     return Person.create({
//       firstName: Faker.name.firstName(),
//       lastName: Faker.name.lastName(),
//       email: Faker.internet.email()
//     }).then(person => {
//       return person.createPost({
//         title: `Sample post by ${person.firstName}`,
//         content: 'here is some content'
//       });
//     });
//   });
// });


// force: true will drop the table if it already exists

// Conn.sync({ force: true }).then(()=> {
// tennisMatches.create({"MatchID":12259540,"DateOfMatch":"2017-08-21T23:40:00+02:00","NeutralGround":1,"MatchTitle":"Istomin, Denis V Dzumhur, Damir","RoundInfoID":24,"RoundName":"1/32","MatchType":"S","TournamentID":57047}).then(person => {
//   console.log(person)
//   });
//});

export default Conn;
