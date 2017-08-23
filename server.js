import Express from 'express';
import GraphHTTP from 'express-graphql';
import compression from 'compression';
import http from 'http';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import Schema from './schema';
import crons from './crons'
import rp from 'request-promise';
import {parseString} from 'xml2js';
import _ from 'lodash';
import Db from './db';
crons();


// Config
const APP_PORT = 3000;

// Start
const app = Express();

// GraphQL
var router = Express.Router();
app.use(compression())
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', router)
app.use('/home', function(req,res){
  res.send('ok')
})
app.use('/xmljson', function(req,res){
  // rp('http://rtspros.com:5051/getxml/tennis.today')
  //   .then(function (htmlString) {
  //     parseString(htmlString, {trim: true,normalizeTags:true,explicitArray:false}, function (err, result) {
  //       var matches=_.chain(result).get('root').pickBy((value,key)=>{return _.startsWith(value.name, "cuptree_Tennis")}).map((value,key)=>value.name).value()
  //      res.send(matches)
  //     });
  //   })
  //   .catch(function (err) {
  //       // Crawling failed...
  //   });
  //   return false;
  var url="http://rtspros.com:5051/xml/cuptree_Tennis.ATP.WinstonSalemUSA.xml";

  var MatchType=url.includes('doubles')?'D':'S';
  rp(url)
    .then(function (htmlString) {
      parseString(htmlString, {trim: true,normalizeTags:true,explicitArray:false}, function (err, result) {
        var data=_.get(result,'ns2:sportradardata.sport');
        var sportinfo=_.get(data,'$.id');
        var categoryinfo=_.get(data,'category.$');
        var tournament=_.get(data,'category.tournament');
        var TournamentID=_.get(tournament,'$.id')
        var cupround=_.get(tournament,'cuptree.cupround')
        var obj=[];
        //console.log(cupround)
        cupround.forEach((round)=>{
          var cupblock=_.get(round,'cupblock');
          //console.log(_.get(cupblock,'$.description'))
          cupblock.forEach((match)=>{
            var isFinished=_.get(match,'$.finished');
            if(!isFinished){
              var matchdata=_.get(match,'matches.match');
              var m={}
              m.MatchID=+_.get(matchdata,'$.id')
              m.DateOfMatch=_.get(matchdata,'$.dateOfMatch');
              m.NeutralGround=_.get(matchdata,'$.neutralGround')=="true"?1:0;
              m.MatchTitle=`${_.get(matchdata,'teams.team[0].$.name')} V ${_.get(matchdata,'teams.team[1].$.name')}`;
              m.RoundInfoID=+_.get(matchdata,'roundinfo.$.cupRound');
              m.RoundName=_.get(matchdata,'roundinfo.$.roundname');
              m.MatchType=MatchType;
              m.TournamentID=+TournamentID;
              obj.push(m)
            }
          })
        })
        var activeCupround=null;
        // if(obj.length>0){
        //   var table=Db.models.sportradar_matchmasters;
        //   obj.forEach((item)=>{
        //
        //     table.findOne({where:{MatchID:item.MatchID}}).then((exists)=>{
        //       console.log(exists)
        //       if(exists){
        //         table.update(item,{where:{MatchID:item.MatchID}})
        //       }else{
        //           table.create(item).then((_match)=>{console.log(_match)});
        //       }
        //     })
        //   })
        // }
        res.send(result)
      });
    })
    .catch(function (err) {
        // Crawling failed...
    });

})
app.use('/graphql', GraphHTTP({
  schema: Schema,
  pretty: true,
  graphiql: true
}));

app.listen(APP_PORT, ()=> {
  console.log(`App listening on port ${APP_PORT}`);
});
