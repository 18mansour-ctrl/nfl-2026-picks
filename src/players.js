/* The three boards.
   A ranked field is a better selector than an empty text box: it puts the
   likely names in front of you, orders them by how the market sees them, and
   still lets you write in anybody it has missed.

   Pulled from the books in September 2026 and then curated by hand with
   curate.html — MVP from a VegasInsider consensus, OPOY and DPOY from
   BetOnline.ag, Aaron Donald's DPOY price from Fox Sports. Neither book
   publishes a team or a position, so those are ours.

   The order is Nick's. The prices have been fitted to it — the smallest change
   to the real numbers that makes them read top to bottom, snapped back onto
   the increments a book actually posts. So a price here is honest about where
   a player sits on this board and only roughly honest about the market: Maxx
   Crosby really is +800 somewhere, he is just not the thirteenth best bet on
   this one. The prices order the field and give a pick some context; anyone
   can still be written in.

   MVP 76 · OPOY 62 · DPOY 55. */
const BOARD={
mvp:[
 ['Josh Allen','BUF','QB','+500'],['Joe Burrow','CIN','QB','+800'],
 ['Lamar Jackson','BAL','QB','+800'],['Matthew Stafford','LAR','QB','+1100'],
 ['Justin Herbert','LAC','QB','+1100'],['Drake Maye','NE','QB','+1100'],
 ['Caleb Williams','CHI','QB','+1200'],['Trevor Lawrence','JAX','QB','+1300'],
 ['Patrick Mahomes','KC','QB','+1300'],['Jayden Daniels','WAS','QB','+1600'],
 ['Dak Prescott','DAL','QB','+1600'],['Jordan Love','GB','QB','+2000'],
 ['Brock Purdy','SF','QB','+2000'],['Bo Nix','DEN','QB','+2500'],
 ['Jalen Hurts','PHI','QB','+2500'],['Sam Darnold','SEA','QB','+2500'],
 ['Jared Goff','DET','QB','+2500'],['Kyler Murray','MIN','QB','+4000'],
 ['Jaxson Dart','NYG','QB','+4000'],['Baker Mayfield','TB','QB','+4000'],
 ['C.J. Stroud','HOU','QB','+5000'],['Cam Ward','TEN','QB','+5000'],
 ['Jahmyr Gibbs','DET','RB','+5000'],['Bijan Robinson','ATL','RB','+6000'],
 ['Myles Garrett','LAR','EDGE','+10000'],['Daniel Jones','IND','QB','+10000'],
 ['Tyler Shough','NO','QB','+10000'],['Aaron Rodgers','PIT','QB','+10000'],
 ['Bryce Young','CAR','QB','+10000'],['Jacoby Brissett','ARI','QB','+17500'],
 ['Malik Willis','MIA','QB','+17500'],['Michael Penix Jr.','ATL','QB','+17500'],
 ['Fernando Mendoza','LV','QB','+17500'],['Geno Smith','NYJ','QB','+17500'],
 ['Puka Nacua','LAR','WR','+17500'],['Christian McCaffrey','SF','RB','+17500'],
 ['Tua Tagovailoa','ATL','QB','+17500'],['Kirk Cousins','LV','QB','+17500'],
 ['Justin Jefferson','MIN','WR','+17500'],['Ja\'Marr Chase','CIN','WR','+17500'],
 ['Will Anderson Jr.','HOU','EDGE','+17500'],['Joe Flacco','CIN','QB','+17500'],
 ['Anthony Richardson','IND','QB','+17500'],['Mac Jones','SF','QB','+17500'],
 ['Shedeur Sanders','CLE','QB','+17500'],['Deshaun Watson','CLE','QB','+17500'],
 ['Saquon Barkley','PHI','RB','+17500'],['Jaxon Smith-Njigba','SEA','WR','+17500'],
 ['CeeDee Lamb','DAL','WR','+17500'],['James Cook','BUF','RB','+17500'],
 ['Jonathan Taylor','IND','RB','+17500'],['Derrick Henry','BAL','RB','+17500'],
 ['De\'Von Achane','MIA','RB','+20000'],['Drake London','ATL','WR','+20000'],
 ['J.J. McCarthy','MIN','QB','+20000'],['Amon-Ra St. Brown','DET','WR','+25000'],
 ['Nico Collins','HOU','WR','+25000'],['Malik Nabers','NYG','WR','+25000'],
 ['Travis Hunter','JAX','WR/CB','+25000'],['Aaron Donald','LAR','DT','+40000'],
 ['Jared Verse','CLE','EDGE','+40000'],['Aidan Hutchinson','DET','EDGE','+40000'],
 ['Nik Bonitto','DEN','EDGE','+40000'],['Nick Bosa','SF','EDGE','+40000'],
 ['Travis Etienne Jr.','NO','RB','+40000'],['Maxx Crosby','LV','EDGE','+40000'],
 ['Jeffery Simmons','TEN','DT','+40000'],['Micah Parsons','GB','EDGE','+40000'],
 ['Omarion Hampton','LAC','RB','+40000'],['Javonte Williams','DAL','RB','+40000'],
 ['Bucky Irving','TB','RB','+50000'],['Jalen Carter','PHI','DT','+50000'],
 ['Mike Evans','SF','WR','+50000'],['George Pickens','DAL','WR','+50000'],
 ['Chris Olave','NO','WR','+50000'],['Cam Skattebo','NYG','RB','+50000']],
opoy:[
 ['Jahmyr Gibbs','DET','RB','+750'],['Bijan Robinson','ATL','RB','+900'],
 ['Ja\'Marr Chase','CIN','WR','+900'],['Puka Nacua','LAR','WR','+1000'],
 ['Jonathan Taylor','IND','RB','+1300'],['Jaxon Smith-Njigba','SEA','WR','+1300'],
 ['Justin Jefferson','MIN','WR','+1400'],['Amon-Ra St. Brown','DET','WR','+1400'],
 ['Christian McCaffrey','SF','RB','+1400'],['James Cook','BUF','RB','+1800'],
 ['Malik Nabers','NYG','WR','+1800'],['Derrick Henry','BAL','RB','+1800'],
 ['CeeDee Lamb','DAL','WR','+1800'],['Ashton Jeanty','LV','RB','+2500'],
 ['Saquon Barkley','PHI','RB','+2500'],['De\'Von Achane','MIA','RB','+2500'],
 ['Jeremiyah Love','ARI','RB','+3300'],['Rashee Rice','KC','WR','+3300'],
 ['Nico Collins','HOU','WR','+3300'],['Brock Bowers','LV','TE','+5500'],
 ['Drake London','ATL','WR','+5500'],['Trey McBride','ARI','TE','+5500'],
 ['Josh Allen','BUF','QB','+5500'],['Lamar Jackson','BAL','QB','+5500'],
 ['Kenneth Walker III','KC','RB','+5500'],['Cam Skattebo','NYG','RB','+5500'],
 ['Omarion Hampton','LAC','RB','+5500'],['Tetairoa McMillan','CAR','WR','+5500'],
 ['Davante Adams','LAR','WR','+6600'],['Bucky Irving','TB','RB','+6600'],
 ['George Pickens','DAL','WR','+6600'],['A.J. Brown','NE','WR','+6600'],
 ['Terry McLaurin','WAS','WR','+7500'],['Travis Etienne Jr.','NO','RB','+7500'],
 ['Chase Brown','CIN','RB','+8000'],['Caleb Williams','CHI','QB','+8000'],
 ['Jayden Daniels','WAS','QB','+8000'],['Joe Burrow','CIN','QB','+8000'],
 ['Justin Herbert','LAC','QB','+8000'],['Patrick Mahomes','KC','QB','+8000'],
 ['Trevor Lawrence','JAX','QB','+8000'],['Breece Hall','NYJ','RB','+8000'],
 ['Garrett Wilson','NYJ','WR','+8000'],['Javonte Williams','DAL','RB','+8000'],
 ['Kyren Williams','LAR','RB','+8000'],['Brock Purdy','SF','QB','+10000'],
 ['Chris Olave','NO','WR','+10000'],['Zay Flowers','BAL','WR','+10000'],
 ['Christian Watson','GB','WR','+10000'],['Colston Loveland','CHI','TE','+10000'],
 ['Dak Prescott','DAL','QB','+10000'],['Daniel Jones','IND','QB','+10000'],
 ['DJ Moore','BUF','WR','+10000'],['Emeka Egbuka','TB','WR','+10000'],
 ['Jalen Hurts','PHI','QB','+10000'],['Jaylen Waddle','DEN','WR','+10000'],
 ['Marvin Harrison Jr.','ARI','WR','+10000'],['Matthew Stafford','LAR','QB','+10000'],
 ['Mike Evans','SF','WR','+10000'],['Rico Dowdle','PIT','RB','+10000'],
 ['RJ Harvey','DEN','RB','+10000'],['TreVeyon Henderson','NE','RB','+10000']],
dpoy:[
 ['Myles Garrett','LAR','EDGE','+450'],['Will Anderson Jr.','HOU','EDGE','+750'],
 ['Aidan Hutchinson','DET','EDGE','+900'],['Micah Parsons','GB','EDGE','+1000'],
 ['Aaron Donald','LAR','DT','+1800'],['Jared Verse','CLE','EDGE','+1800'],
 ['Nik Bonitto','DEN','EDGE','+1800'],['Danielle Hunter','HOU','EDGE','+1800'],
 ['Nick Bosa','SF','EDGE','+1800'],['Fred Warner','SF','LB','+2800'],
 ['Kyle Hamilton','BAL','S','+2800'],['Trey Hendrickson','BAL','EDGE','+2800'],
 ['Josh Hines-Allen','JAX','EDGE','+2800'],['Maxx Crosby','LV','EDGE','+2800'],
 ['Devon Witherspoon','SEA','CB','+2800'],['Brian Burns','NYG','EDGE','+2800'],
 ['T.J. Watt','PIT','EDGE','+2800'],['Quinyon Mitchell','PHI','CB','+3500'],
 ['Jalen Carter','PHI','DT','+3500'],['Carson Schwesinger','CLE','LB','+3500'],
 ['Laiatu Latu','IND','EDGE','+3500'],['Tuli Tuipulotu','LAC','EDGE','+3500'],
 ['Chris Jones','KC','DT','+5000'],['Cooper DeJean','PHI','CB','+5000'],
 ['Abdul Carter','NYG','EDGE','+6600'],['Derwin James Jr.','LAC','S','+7000'],
 ['Derek Stingley Jr.','HOU','CB','+7000'],['Patrick Surtain II','DEN','CB','+7000'],
 ['Quinnen Williams','DAL','DT','+7000'],['Trent McDuffie','LAR','CB','+7000'],
 ['Josh Sweat','ARI','EDGE','+7000'],['Montez Sweat','CHI','EDGE','+7000'],
 ['Andrew Van Ginkel','MIN','LB','+7000'],['Nick Emmanwori','SEA','S','+7000'],
 ['Will McDonald IV','NYJ','EDGE','+7000'],['Bradley Chubb','BUF','EDGE','+7500'],
 ['Byron Young','LAR','EDGE','+8000'],['Devin Lloyd','CAR','LB','+8000'],
 ['George Karlaftis','KC','EDGE','+8000'],['Jaycee Horn','CAR','CB','+8000'],
 ['Jeffery Simmons','TEN','DT','+8000'],['Kamari Lassiter','HOU','CB','+8000'],
 ['Leonard Williams','SEA','DT','+8000'],['Alex Highsmith','PIT','EDGE','+10000'],
 ['Budda Baker','ARI','S','+10000'],['Rueben Bain Jr.','TB','EDGE','+10000'],
 ['Chase Young','NO','EDGE','+10000'],['Greg Rousseau','BUF','EDGE','+10000'],
 ['Jalon Walker','ATL','EDGE','+10000'],['Kevin Byard III','NE','S','+10000'],
 ['Rashan Gary','DAL','EDGE','+10000'],['Talanoa Hufanga','DEN','S','+10000'],
 ['Xavier McKinney','GB','S','+10000'],['Zach Allen','DEN','DT','+10000'],
 ['Zack Baun','PHI','LB','+10000']]};
const board=k=>(BOARD[k]||[]).map(([n,t,p,o])=>({n,t,p,o}));
