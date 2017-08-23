import {CronJob} from 'cron';
import rp from 'request-promise';
import {parseString} from 'xml2js';
import Db from './db';
import _ from 'lodash';
const getUpdatedXML=function(){
  rp('http://rtspros.com:5051/getxml/tennis.today')
    .then(function (htmlString) {
      parseString(htmlString, {trim: true,normalizeTags:true,explicitArray:false}, function (err, result) {
        var matches=_.chain(result).get('root').pickBy((value,key)=>{return _.startsWith(value.name, "cuptree_Tennis")}).map((value,key)=>value.name).value()
       if(matches.length>0){
         matches.forEach((match)=>{
           new getMatches(match)
         })
       }
      });
    })
    .catch(function (err) {
        // Crawling failed...
    });

}
const getMatches=function(url){
  var MatchType=url.includes('doubles')?'D':'S';
  var _url=`http://rtspros.com:5051/xml/${url}`;
  console.log(_url)
  rp(_url)
    .then(function (htmlString) {
      parseString(htmlString, {trim: true,normalizeTags:true,explicitArray:false}, function (err, result) {
        var obj={"$":{"fileName":"Tennis.ATP.CincinnatiUSA","generatedAt":"2017-08-18T05:59:01.073+02:00","serviceId":"18","serviceName":"cuptree","updateType":"delta","xmlns:ns2":"http://xmlexport.scoreradar.com/V1"}}
        var data=_.get(result,'ns2:sportradardata.sport');
        var sportinfo=_.get(data,'$.id');
        var categoryinfo=_.get(data,'category.$');
        var tournament=_.get(data,'category.tournament');
        var TournamentID=_.get(tournament,'$.id')
        var cupround=_.get(tournament,'cuptree.cupround')
        var obj=[];
        cupround.forEach((round)=>{
          var cupblock=_.get(round,'cupblock');
          cupblock.forEach((match)=>{
            if(!isFinished){
              var matchdata=_.get(match,'matches.match');
              var isFinished=_.get(match,'$.finished');
              var m={}
              m.MatchID=+_.get(matchdata,'$.id')
              m.SportRadarID=+_.get(matchdata,'$.id')
              m.DateOfMatch=_.get(matchdata,'$.dateOfMatch');
              m.PageTitle=_.get(categoryinfo,'name');
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

        if(obj.length>0){

          var table=Db.models.sportradar_matchmasters;
          obj.forEach((item)=>{
            console.log('matchid==',item.MatchID)
            table.findOne({where:{MatchID:item.MatchID}}).then((exists)=>{
              console.log('exits=====',exists)
              if(exists){
                table.update(item,{where:{MatchID:item.MatchID}})
              }else{
                  table.create(item).then((_match)=>{});
              }
            })
          })
        }

      });
    })
    .catch(function (err) {
        // Crawling failed...
    });
}
getUpdatedXML();
const crons = function(){
  console.log('in cron')
  var job = new CronJob({
    //0 0 */2 * * *
  cronTime: '0 */2 * * * *',
  onTick: function() {
  getUpdatedXML()
  },
  start: true,
  timeZone: 'America/Los_Angeles'
});
}

export default crons
