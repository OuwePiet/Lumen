// Candidate news sources for De WereldSpiegel. Editorial use must respect each publisher's terms.
// No articles are republished by this registry. It only records feed endpoints and source identities.
export type WereldSpiegelNewsSource={
 id:string;name:string;scope:"global"|"national"|"regional";
 country?:string;kind:"rss"|"discovery";url:string;enabled:boolean;
};
export const WERELDSPIEGEL_NEWS_SOURCES:readonly WereldSpiegelNewsSource[]=[
 {id:"gdelt",name:"GDELT Project",scope:"global",kind:"discovery",url:"https://api.gdeltproject.org/api/v2/doc/doc",enabled:false},
 {id:"bbc-world",name:"BBC News — World",scope:"global",kind:"rss",url:"https://feeds.bbci.co.uk/news/world/rss.xml",enabled:false},
 {id:"guardian-world",name:"The Guardian — World",scope:"global",kind:"rss",url:"https://www.theguardian.com/world/rss",enabled:false},
 {id:"nos",name:"NOS Nieuws",scope:"national",country:"NL",kind:"rss",url:"https://feeds.nos.nl/nosnieuwsalgemeen",enabled:false}
];
