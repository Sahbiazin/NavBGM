// IDs adicionais transcritos da lista comunitária enviada pelo usuário.
// São agregados ao catálogo base para manter cada região em sua pasta numérica.
(() => {
  function add(region, rows) {
    const known = new Set(window.TRACKS[region].map(([id]) => String(id)));

    for (const row of rows) {
      const id = String(row[0]);
      if (known.has(id)) continue;
      window.TRACKS[region].push(row);
      known.add(id);
    }

    window.TRACKS[region].sort((a, b) => Number(a[0]) - Number(b[0]));
  }

  add('1', [
    [385,'Trainers Eyes Meet - Swimmer'],[386,'Meteor Falls / Cave of Origin'],
    [392,'Toughness Contest'],[393,'Coolness Contest'],[394,'Beauty Contest'],[395,'Cuteness Contest'],[396,'Smart Contest'],[397,'Trainers Eyes Meet - Gentleman'],
    [398,'Verdanturf'],[399,'Rustboro / Mossdeep / Mauville'],[400,'Pokemon Center'],[401,'Route 104 - 109 / 115-116'],[402,'Route 118 - 119 / 129-134'],[404,'Mart'],[405,'Littleroot'],[406,'Mirage Tower / Sky Pillar / Mt Chimney'],[407,'Trainers Eyes Meet - Aroma Lady / Lass / Triathlete (F)'],[408,'Lilycove / Pacifidlog'],[409,'Route 111 - Desert'],[411,'Underwater / Dive'],[412,'Victory! (Trainer)'],
    [415,"May's Theme"],[416,'Trainers Eyes Meet - Expert / Black Belt / Psychic'],[417,'Trainers Eyes Meet - Bird Keeper / Cool Trainer'],[418,'Route 113'],[419,'Team Aqua Appears'],[420,'Hurry Along'],[421,'Secret Bases'],[422,'Evergrande City'],[423,'Trainers Eyes Meet - Bug Maniac / Hex Maniac / Ninja Boy'],[424,'Victory! (Team Aqua)'],
    [426,'Game Corner'],[427,'Dewford'],[428,'Safari Zone'],[429,'Victory Road / Elite Four'],[430,'Aqua / Magma Hideout'],[432,'Mt. Pyre'],[433,'Slateport'],[434,'Mt. Pyre Exterior'],[437,'Fallarbor'],[441,'Team Magma Appears'],
    [445,'Sootopolis'],[446,'Contest - Winner!'],[447,'Hall of Fame'],[448,'Trick House'],[449,'Trainers Eyes Meet - Twins'],[450,'Trainers Eyes Meet - Elite Four'],[451,'Trainers Eyes Meet - Fisherman / Hiker / Ruin Maniac'],[452,'Contest Hall - Lobby'],[454,'Trainers Eyes Meet - Champion'],
    [457,'Battle Frontier'],[458,'Battle Arena'],[461,'Battle Pyramid'],[463,'Battle Palace'],[465,'Battle Tower'],[468,'Battle Pike'],[469,'Battle Factory'],[473,'Battle Dome'],[474,'Battle! (Wild Pokemon)'],[475,'Battle! (Team Magma / Aqua Grunts)'],[476,'Battle! (Trainer)'],[477,'Battle! (Gym Leader)'],[478,'Battle! (Champion)'],[481,'Battle! (May)'],[482,'Battle! (Elite Four)'],[483,'Battle! (Magma / Aqua Leader Maxie / Archie)']
  ]);
  add('2', [
    [1055,'Skyarrow Bridge'],[1056,'Driftveil Drawbridge'],[1057,'Tubeline Bridge'],[1058,'Village Bridge'],[1059,'Marvelous Bridge'],[1060,'Pokemon Center'],[1061,'Shopping Mall Nine'],[1062,'Pokemon Gym'],[1064,'Juniper Pokemon Lab'],[1065,'Gate'],[1066,'Gear Station'],[1067,'Battle Subway'],[1069,'Royal Unova'],[1073,'Pokemon League'],[1075,"N's Castle Bridge (Embracing One's Duty)"],[1076,"N's Castle"],[1077,'The Dreamyard'],[1078,'Chargestone Cave'],[1079,'Cold Storage'],[1080,'Relic Castle'],[1081,'Celestial / Dragonspiral Tower'],[1082,'Lostlorn Forest'],[1083,'Dragonspiral Tower Summit'],[1084,'Victory Road'],[1085,"Mum's Theme"],[1086,'Hurry Along'],[1087,"Cheren's Theme"],[1088,"Bianca's Theme"],[1089,"Professor Juniper's Theme"],[1090,"Professor Cedric Juniper's Theme"],[1091,'Plasma Grunt (Team Plasma Appears!)'],[1092,'N (Prisoner to a Formula)'],[1093,'Sage (Team Plasma Plots)'],[1094,"Ghetsis (Ghetsis' Ambitions)"],[1095,"Gym Leader's Last Pokemon (Victory Lies Before You!)"],[1099,'Farewell'],[1100,"Looker's Theme"],[1101,"Champion Alder's Theme"],[1103,'Ferris Wheel'],[1104,"N's Castle Appears (The Pokemon League Besieged!)"],[1105,'The Dragon Awakes (Reshiram / Black)'],[1106,'The Dragon Awakes (Zekrom / White)'],[1107,'Musical Theater'],
    [1114,'Trainers Eyes Meet - Youngster'],[1115,'Trainers Eyes Meet - Lass'],[1116,'Trainers Eyes Meet - Twins'],[1117,'Trainers Eyes Meet - Ace Trainer'],[1118,'Trainers Eyes Meet - Roughneck'],[1119,'Trainers Eyes Meet - Parasol Lady'],[1120,'Trainers Eyes Meet - Swimmer Male'],[1121,'Trainers Eyes Meet - Psychic'],[1122,'Trainers Eyes Meet - Scientist'],[1123,'Trainers Eyes Meet - Clown'],[1124,'Trainers Eyes Meet - Backpacker'],[1125,'Trainers Eyes Meet - Businessman'],[1126,'Trainers Eyes Meet - Gentleman'],[1127,'Trainers Eyes Meet - Team Plasma'],[1128,'Battle! Wild Pokemon'],[1129,'Battle! Strong Wild Pokemon'],[1130,'Battle! Trainer'],[1131,'Battle! Subway Trainer'],[1132,'Battle! Gym Leader'],[1133,'Battle! Rival'],[1134,'Battle! Team Plasma Grunt'],[1135,'Battle! Elite Four'],[1136,'Battle! Champion'],[1137,'Battle! N'],[1138,'Battle! N Final'],[1139,'Battle! Ghetsis'],[1140,'Battle! SHIN'],[1141,'Battle! MU'],[1142,'Battle! RAI'],[1144,'Battle! Legendary Pokemon'],[1145,'Battle! Cynthia'],[1147,"Victory Lies Before You! (Gym Leader's Last Pokemon)"],[1148,'Victory! Wild Pokemon'],[1149,'Victory! Trainer'],[1150,'Victory! Gym Leader'],[1151,'Victory! Team Plasma'],[1152,'Victory! Champion'],[1160,"Cynthia's Theme"],[1161,"Let's Go Together!"],[1163,'Battle! TRAINER-M'],[1164,'Battle! TRAINER-S'],[1168,'Wifi Battle (also PvP Battle)']
  ]);
  const unova = window.TRACKS['2'];
  for (const track of unova) {
    if (String(track[0])==='1157') track[1]='Spin Trade (also rare login screen)';
    if (String(track[0])==='1159') track[1]='World Champion Station (WCS) (also login screen)';
  }
})();
