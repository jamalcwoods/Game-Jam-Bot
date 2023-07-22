const { initializeApp} = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database')

const { Client, Intents, Permissions } = require('discord.js');
const { token, firebase} = require("./private/credentials.json");

let guildID = "637333734307397642"

let listChannelID = "918537592109170708";
let reactChannelID = "918537682727092235";
let reactMessageID = "918543467376955412";
let participantRole = "918655248137089085"
let moderatorRole = "918625075698237480"
let lftRole = "918658166068232192"
let finish = "Congrats! Your game idea has been add to the #game-idea-list channel. Here's what you can do next:\n"
finish +=  "\n-Look for teammates in the **Looking for Teams** channels, categorized by skill roles."
finish +=  "\n-While you can't @everyone, feel free to use the following to find users in the server: @designer, @developer, @musician, @2d artist, @3d artist"
finish += "\n-Still can't get a team together? No worries, after the kick off ceremonies on Saturday at 2pm EST, you'll have the opportunity to pitch your game idea to all participants in the Team Assembly Stages channel"


let roleEmojiDictionary = {
	"🇦":"918533314581766154",
	"🇧":"918533238027354153",
	"🇨":"918533064408326235",
	"🇩":"918533359142047784",
	"🇪":"918533410849435690"
}

let roles = [
	"918533314581766154",
	"918533238027354153",
	"918533064408326235",
	"918533359142047784",
	"918533410849435690"
]

let roleSkillDictionary ={
	"918533314581766154":"designers",
	"918533238027354153":"twoD",
	"918533064408326235":"threeD",
	"918533359142047784":"developers",
	"918533410849435690":"musicians"
}

// Create a new client instance

const client = new Client({
	intents: 
		[
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
			Intents.FLAGS.GUILD_MEMBERS,
			Intents.FLAGS.DIRECT_MESSAGES
		],
	partials: [
		"CHANNEL"
	],
	fetchAllMembers: true 
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
	client.user.setActivity("Helping run the DEV EXP Game Jam!\n(https://www.coexistgaming.com/devexp)",{
		name:"DEV EXP Game Jam",
		url:"https://www.coexistgaming.com/devexp"
	})
	console.log('Running...');
	client.channels.fetch(reactChannelID).then(c =>{
		if(!reactMessageID){
			c.send("To get roles for your talents, react to this message with the corresponding Emojis. Once you do this, you will gain access to the rest of the channels for the DEV EXP Game Jam\n\n🇦 - Designer\n🇧 - 2D Artist\n🇨 - 3D Artist\n🇩 - Developer\n🇪 - Musician").then(reactMsg => {
				reactMsg.react("🇦").then(() =>{
					reactMsg.react("🇧").then(() =>{
						reactMsg.react("🇨").then(() =>{
							reactMsg.react("🇩").then(() =>{
								reactMsg.react("🇪").then(() =>{
									console.log(reactMsg.id)
								})
							})
						})
					})
				})
			})
		} else {
			client.channels.cache.get(reactChannelID).messages.fetch(reactMessageID)
		}
	})
	client.guilds.cache.get(guildID).members.fetch();

	UpdateGameIdeaBoard()
});


const app = initializeApp(firebase);
const db = getDatabase(app)
client.login(token);

let gameIdeaPromptManager = {}

client.on('messageCreate', (message) => {
	if(!message.author.bot){
		let input = message.content.split(" ")
		// if(message.content.split("")[0] != "!" && message.channel.id == "918218712450998352"){
		// 	message.delete()
		// 	message.channel.send("<@" + message.author.id + ">, you may only type commands in this channel").then(msg =>{
		// 		setTimeout(() => msg.delete(), 3000)
		// 	})
		// }
		
		if(message.channel.type == "DM"){
			if(message.author.id != "916053229291327549"){
				if(gameIdeaPromptManager[message.author.id] != undefined){
					let data = gameIdeaPromptManager[message.author.id];
					switch(data.question){
						case 0:
							gameIdeaPromptManager[message.author.id].name = message.content
							gameIdeaPromptManager[message.author.id].question++;
							message.channel.send("Enter a short description for this game idea")
							break;
						case 1:
							gameIdeaPromptManager[message.author.id].description = message.content
							gameIdeaPromptManager[message.author.id].question++
							message.channel.send("Enter your full name")
							break;

						case 2:
							gameIdeaPromptManager[message.author.id].creatorName = message.content
							gameIdeaPromptManager[message.author.id].question++;
							message.channel.send("Enter your email")
							break;
						case 3:
							gameIdeaPromptManager[message.author.id].creatorEmail = message.content
							gameIdeaPromptManager[message.author.id].question++;
							message.channel.send("Have you already found people to work with? (yes/no)")
							break;
						case 4:
							if(["yes","no"].includes(message.content.toLocaleLowerCase())){
								if(message.content.toLocaleLowerCase() == "yes"){
									gameIdeaPromptManager[message.author.id].premade = true
								}
								gameIdeaPromptManager[message.author.id].question++
								message.channel.send("Do you need developers for your team?(yes/no)")
							} else {
								message.channel.send("Do you already plan to work with people on this game idea? (yes/no)")
							}
							break;
						case 5:
							if(["yes","no"].includes(message.content.toLocaleLowerCase())){
								gameIdeaPromptManager[message.author.id].team.developers = message.content
								gameIdeaPromptManager[message.author.id].question++
								message.channel.send("Do you need 2D artists for your team?(yes/no)")
								break;
							} else {
								message.channel.send("Do you need developers for your team?(yes/no)")
							}
							break;
						case 6:
							if(["yes","no"].includes(message.content.toLocaleLowerCase())){
								gameIdeaPromptManager[message.author.id].team.twoD = message.content
								gameIdeaPromptManager[message.author.id].question++
								message.channel.send("Do you need 3D artists for your team?(yes/no)")
								break;
							} else {
								message.channel.send("Do you need 2D artists for your team?(yes/no)")
							}
							break;
						case 7:
							if(["yes","no"].includes(message.content.toLocaleLowerCase())){
								gameIdeaPromptManager[message.author.id].team.threeD = message.content
								gameIdeaPromptManager[message.author.id].question++
								message.channel.send("Do you need designers for your team?(yes/no)")
								break;
							} else {
								message.channel.send("Do you need 3D artists for your team?(yes/no)")
							}
							break;
						case 8:
							if(["yes","no"].includes(message.content.toLocaleLowerCase())){
								gameIdeaPromptManager[message.author.id].team.designers = message.content
								gameIdeaPromptManager[message.author.id].question++
								message.channel.send("Do you need musicians for your team?(yes/no)")
								break;
							} else {
								message.channel.send("Do you need designers for your team?(yes/no)")
							}
							break;
						case 9:
							if(["yes","no"].includes(message.content.toLocaleLowerCase())){
								gameIdeaPromptManager[message.author.id].team.musicians = message.content
								if(gameIdeaPromptManager[message.author.id].premade){
									gameIdeaPromptManager[message.author.id].question++
									message.channel.send("Do you want to pitch your idea to see if anyone else would be interested in joining your team? (yes/no)")
								} else {
									get(ref(db,'gameIdeas/')).then((snapshot) =>{
										let data;
										if(!snapshot.exists()){
											data = []
										} else {
											data = snapshot.val();
										}
										gameIdeaPromptManager[message.author.id].number = data.length
										gameIdeaPromptManager[message.author.id].creator = message.author.id
										gameIdeaPromptManager[message.author.id].creatorUsername = client.guilds.cache.get(guildID).members.cache.get(message.author.id).displayName
										let idea = gameIdeaPromptManager[message.author.id]
										let s = "<@" + idea.creator + ">\n"
										s += "```\n"
										s += "#" + (idea.number + 1) + ": " + idea.name
										s += "\nBy " + idea.creatorUsername
										s += "\n" + idea.description +"\n"
										s += "\nLooking For:"
										s += "\nDevelopers: " + idea.team.developers
										s += "\n2D Artists: " + idea.team.twoD
										s += "\n3D Artists: " + idea.team.threeD
										s += "\nDesigners: " + idea.team.designers
										s += "\nMusicians: " + idea.team.musicians
										let count = 0;
										if(idea.votes != undefined){
											for(let i in idea.votes){
												count++;
											}
										}
										s += "\n\nVotes: " + count 
										s += "\n```"
										client.channels.cache.get(listChannelID).send(s).then(msg =>{
											gameIdeaPromptManager[message.author.id].listMessage = msg.id
											data.push(gameIdeaPromptManager[message.author.id])
											set(
												ref(db,'gameIdeas/')
												,data
											);
											UpdateGameIdeaBoard();
											delete gameIdeaPromptManager[message.author.id]
											message.channel.send(s)
											message.channel.send(finish)
										})
									})
								}
							} else {
								message.channel.send("Do you need musicians for your team?(yes/no)")
							}
							break;
						case 10:
							if(message.content.toLocaleLowerCase() == "no"){
								get(ref(db,'gameIdeas/')).then((snapshot) =>{
									let data;
									if(!snapshot.exists()){
										data = []
									} else {
										data = snapshot.val();
									}
									gameIdeaPromptManager[message.author.id].number = data.length
									gameIdeaPromptManager[message.author.id].showcase = false
									gameIdeaPromptManager[message.author.id].creator = message.author.id
									gameIdeaPromptManager[message.author.id].creatorUsername = client.guilds.cache.get(guildID).members.cache.get(message.author.id).displayName
									let idea = gameIdeaPromptManager[message.author.id]
									let s = "<@" + idea.creator + ">\n"
									s += "```\n"
									s += "#" + (idea.number + 1) + ": " + idea.name
									s += "\nBy " + idea.creatorUsername
									s += "\n" + idea.description +"\n"
									s += "\nLooking For:"
									s += "\nDevelopers: " + idea.team.developers
									s += "\n2D Artists: " + idea.team.twoD
									s += "\n3D Artists: " + idea.team.threeD
									s += "\nDesigners: " + idea.team.designers
									s += "\nMusicians: " + idea.team.musicians
									let count = 0;
									if(idea.votes != undefined){
										for(let i in idea.votes){
											count++;
										}
									}
									s += "\n\nVotes: " + count 
									s += "\n```"
									client.channels.cache.get(listChannelID).send(s).then(msg =>{
										gameIdeaPromptManager[message.author.id].listMessage = msg.id
										data.push(gameIdeaPromptManager[message.author.id])
										set(
											ref(db,'gameIdeas/')
											,data
										);
										UpdateGameIdeaBoard();
										delete gameIdeaPromptManager[message.author.id]
										get(ref(db,'gameTeams/')).then((snapshot) =>{
											let gameTeams;
											if(snapshot.exists()){
												gameTeams = snapshot.val()
											} else {
												gameTeams = []
											}
											client.guilds.cache.get(guildID).roles.create({
												name: idea.name,
												color: [
													Math.floor(Math.random() * 256),
													Math.floor(Math.random() * 256),
													Math.floor(Math.random() * 256)	
												],
												hoist:true,
												position:7
											}).then(role =>{
												client.guilds.cache.get(guildID).members.cache.get(idea.creator).roles.remove(lftRole)
												client.guilds.cache.get(guildID).members.cache.get(idea.creator).roles.add(role)
												client.guilds.cache.get(guildID).channels.create(idea.name.replace(/ /g,"-"),{
													type:"GUILD_TEXT",
													permissionOverwrites: [
														{
															id: client.guilds.cache.get(guildID).roles.everyone,
															deny: [Permissions.FLAGS.VIEW_CHANNEL],
														},
														{
															id: role.id,
															allow: [Permissions.FLAGS.VIEW_CHANNEL],
														}
													],
												}).then(channel =>{
													client.guilds.cache.get(guildID).channels.create(idea.name.replace(/ /g,"-"),{
														type:"GUILD_VOICE",
														permissionOverwrites: [
															{
																id: client.guilds.cache.get(guildID).roles.everyone,
																deny: [Permissions.FLAGS.VIEW_CHANNEL],
															},
															{
																id: role.id,
																allow: [Permissions.FLAGS.VIEW_CHANNEL],
															}
														]
													}).then(channel2 => {
														channel.setParent("909929068131147808")
														channel2.setParent("909929068131147808")
														let team = {
															"gameName": idea.name,
															"leader":idea.creator,
															"members":[
																{
																	"id":idea.creator
																}
															],
															"roleID":role.id,
															"tchannelID":channel.id,
															"vchannelID":channel2.id,
															"slots":idea.team
														}
														gameTeams.push(team)
														set(
															ref(db,'gameTeams/'),gameTeams
														)
														message.channel.send("Please head to <#" + channel.id + "> in " + client.guilds.cache.get(guildID).name + " for your next steps")
														channel.send("<@" + idea.creator + ">, because you have a team and are ready to start working your game idea has been approved!\nA role and voice/text channels (<#" + channel.id + ">,<#" + channel2.id + ">) have been created for your game's development team. You can begin inviting people to your team by doing `!invite @DISCORD_NAME_HERE` in the <#918218712450998352> channel")
													})
												})
											})
										})
									})
								})
							} else if(message.content.toLocaleLowerCase() == "yes"){
								get(ref(db,'gameIdeas/')).then((snapshot) =>{
									let data;
									if(!snapshot.exists()){
										data = []
									} else {
										data = snapshot.val();
									}
									gameIdeaPromptManager[message.author.id].number = data.length
									gameIdeaPromptManager[message.author.id].creator = message.author.id
									gameIdeaPromptManager[message.author.id].creatorUsername = client.guilds.cache.get(guildID).members.cache.get(message.author.id).displayName
									let idea = gameIdeaPromptManager[message.author.id]
									let s = "<@" + idea.creator + ">\n"
									s += "```\n"
									s += "#" + (idea.number + 1) + ": " + idea.name
									s += "\nBy " + idea.creatorUsername
									s += "\n" + idea.description +"\n"
									s += "\nLooking For:"
									s += "\nDevelopers: " + idea.team.developers
									s += "\n2D Artists: " + idea.team.twoD
									s += "\n3D Artists: " + idea.team.threeD
									s += "\nDesigners: " + idea.team.designers
									s += "\nMusicians: " + idea.team.musicians
									let count = 0;
									if(idea.votes != undefined){
										for(let i in idea.votes){
											count++;
										}
									}
									s += "\n\nVotes: " + count 
									s += "\n```"
									client.channels.cache.get(listChannelID).send(s).then(msg =>{
										gameIdeaPromptManager[message.author.id].listMessage = msg.id
										data.push(gameIdeaPromptManager[message.author.id])
										set(
											ref(db,'gameIdeas/')
											,data
										);
										UpdateGameIdeaBoard();
										delete gameIdeaPromptManager[message.author.id]
										message.channel.send(s)
										message.channel.send(finish)
									})
								})
							} else {
								message.channel.send("Do you want to pitch your idea to see if anyone else would be interested in joining your team? (yes/no)")
							}
							break;

					}
				}
			}
		}

		if(input[0] == "!gameidea"){
			get(ref(db,'gameIdeas/')).then((snapshot) =>{
				let dupe = false
				if(snapshot.exists()){
					let ideas = snapshot.val();
					for(let i in ideas){
						if(ideas[i].creator == message.author.id){
							dupe = true
							break;
						}
					}
				}
				if(!dupe){
					gameIdeaPromptManager[message.author.id] = {
						question:0,
						name:"",
						creatorName:"",
						creatorEmail:"",
						description:"",
						creator:"",
						creatorUsername:"",
						team:{
							"developers":0,
							"twoD":0,
							"threeD":0,
							"designers":0,
							"musicians":0
						},
						premade:false,
						showcase:true
					}
					if(message.channel.type != "DM"){
						message.channel.send("Game idea questions have been sent to you via direct messages")
						try {
							client.guilds.cache.get(guildID).members.cache.get(message.author.id).createDM().then(dm =>{
								dm.send("Please type the name of your game idea")
							})
						} catch {
							message.channel.send("The bot may not be able to send you DM's. Please enable server members to send you DM's in your privacy settings for this server.")
							message.channel.send({
								files: [{
									attachment: './AllowDM.png',
									name:"AllowDM"
								}]
							})
						}
					} else {
						message.channel.send("Please type the name of your game idea")
					}
				} else {
					message.channel.send("Only one idea may be submitted per person")
				}
			})
		}
		
		if(input[0] == "!vote"){
			get(ref(db,'gameIdeas/' + (parseInt(input[1]) - 1))).then((snapshot) =>{
				if(snapshot.exists()){
					let idea = snapshot.val();
					if(idea.votes == undefined){
						idea.votes = {}
					}
					idea.votes[message.author.id] = true;
					set(
						ref(db,'gameIdeas/' + (parseInt(input[1]) - 1) + '/votes/')
						,idea.votes
					);
					client.guilds.cache.get(guildID).members.cache.get(message.author.id).createDM().then(dm =>{
						dm.send("You voted for Game Idea #" + input[1] + ": ")
						//message.delete()
						UpdateGameIdeaBoard()
					})
				} else {
					message.channel.send("Game idea #" + input[1] + " not found")	
				}
			})
		}

		if(input[0] == "!invite"){
			get(ref(db,'gameTeams/')).then((snapshot) =>{
				if(snapshot.exists()){
					let teams = snapshot.val()
					let onTeam = false;
					let teamOn;
					for(let i in teams){
						let team = teams[i]
						if(message.member.id == team.leader){
							onTeam = true;
							teamOn = team;
							break;
						}
					}
					if(onTeam){
						if(input[1].substring(0,2) == "<@" && input[1].slice(-1) == ">"){
							var id = input[1].split("@")[1].replace(">","").replace("!","")
							message.guild.members.cache.get(id).roles.add(teamOn.roleID)
							message.guild.members.cache.get(id).roles.remove(lftRole)
							message.channel.send(message.guild.members.cache.get(id).displayName + " has been added to the team for <@&" + teamOn.roleID + ">")	
						}
					} else {
						message.channel.send("You must be the leader of a game team to invite someone else onto your game team")
					}
				}
			})
		}

		if(message.guild != undefined){
			if(["!remove","!approve","!inspect"].includes(input[0])){
				if(message.member.roles.cache.has(moderatorRole)){
					if(input[0] == "!remove"){
						get(ref(db,'gameIdeas/')).then((snapshot) =>{
							let gameIdeas = snapshot.val();
							if(gameIdeas[parseInt(input[1]) - 1] != undefined){
								client.channels.cache.get(listChannelID).messages.fetch(gameIdeas[parseInt(input[1]) - 1].listMessage).then(msg =>{
									gameIdeas.splice(parseInt(input[1]) - 1);
									set(
										ref(db,'gameIdeas/')
										,gameIdeas
									);
									UpdateGameIdeaBoard();
									message.channel.send("Game idea #" + input[1] + " was removed")	
									msg.delete()
								})
							} else {
								message.channel.send("Game idea #" + input[1] + " not found")	
							}
						})
					}

					if(input[0] == "!approve"){
						get(ref(db,'gameIdeas/' + (parseInt(input[1]) - 1))).then((snapshot) =>{
							get(ref(db,'gameTeams/')).then((snapshot2) =>{
								let gameTeams;
								let error = false;
								if(snapshot.exists()){
									let idea = snapshot.val();
									if(snapshot2.exists()){
										gameTeams = snapshot2.val()
									} else {
										gameTeams = []
									}
									for(var t in gameTeams){
										if(gameTeams[t].leader == idea.creator){
											error = true;
										}
									}
									if(!error){
										client.guilds.cache.get(guildID).roles.create({
											name: idea.name + "(DEV EXP)",
											color: [
												Math.floor(Math.random() * 256),
												Math.floor(Math.random() * 256),
												Math.floor(Math.random() * 256)	
											],
											hoist:true,
											position:7
										}).then(role =>{
											client.guilds.cache.get(guildID).members.cache.get(idea.creator).roles.remove(lftRole)
											client.guilds.cache.get(guildID).members.cache.get(idea.creator).roles.add(role)
											client.guilds.cache.get(guildID).channels.create(idea.name.replace(/ /g,"-"),{
												type:"GUILD_TEXT"
											}).then(channel =>{
												client.guilds.cache.get(guildID).channels.create(idea.name.replace(/ /g,"-"),{
													type:"GUILD_VOICE"
												}).then(channel2 => {
													channel.setParent("909929068131147808")
													channel2.setParent("909929068131147808")
													let channelPerms = [
														{
															id: message.guild.roles.everyone,
															deny: [Permissions.FLAGS.VIEW_CHANNEL],
														},
														{
															id: role.id,
															allow: [Permissions.FLAGS.VIEW_CHANNEL],
														},
														{
															id: moderatorRole,
															allow: [Permissions.FLAGS.VIEW_CHANNEL],
														}
													]
													channel.permissionOverwrites.set(channelPerms)
													channel2.permissionOverwrites.set(channelPerms)
													let team = {
														"gameName": idea.name,
														"leader":idea.creator,
														"members":[
															{
																"id":idea.creator
															}
														],
														"roleID":role.id,
														"tchannelID":channel.id,
														"vchannelID":channel2.id,
														"slots":idea.team
													}
													gameTeams.push(team)
													set(
														ref(db,'gameTeams/'),gameTeams
													)
													channel.send("<@" + idea.creator + ">'s game idea (" + idea.name + ") has been approved!\nThe <@&" + role.id + "> role and voice and text channels (<#" + channel.id + ">) have been created for this game's development team. They can begin inviting people to your team by doing `!invite @DISCORD_NAME_HERE` in the <#918218712450998352> channel")
												})
											})
										})
									} else {
										message.channel.send("A team has already been created for this users idea")	
									}
								} else {
									message.channel.send("Game idea #" + input[1] + " not found")	
								}
							})
						})
					}

					if(input[0] == "!inspect"){
						get(ref(db,'gameIdeas/' + (parseInt(input[1]) - 1))).then((snapshot) =>{
							if(snapshot.exists()){
								let idea = snapshot.val();
								let s = "```\n"
								s += "#" + parseInt(input[1]) + ": " + idea.name
								s += "\nBy " + idea.creatorUsername + "(" + idea.creatorName + " - " + idea.creatorEmail + ")"
								s += "\n" + idea.description +"\n"
								if(idea.premade){
									s += "\n\nThe leader of this team already has teammates in mind"	
								} else {
									s += "\nLooking For:"
									s += "\nDevelopers: " + idea.team.developers
									s += "\n2D Artists: " + idea.team.twoD
									s += "\n3D Artists: " + idea.team.threeD
									s += "\nDesigners: " + idea.team.designers
									s += "\nMusicians: " + idea.team.musicians
								}
								if(!idea.showcase){
									s += "\n\nThe leader of this team would not like to showcase their game idea for additional memebers and is ready to begin working"
								} else {
									s += "\n\nThe leader of this team would like to showcase their game idea for additional memebers"
								}
								let count = 0;
								if(idea.votes != undefined){
									for(let i in idea.votes){
										count++;
									}
								}
								s += "\n\nVotes: " + count 
								s += "\n```"
								client.guilds.cache.get(guildID).members.cache.get(message.author.id).createDM().then(dm =>{
									message.channel.send("Information regarding this game idea has been sent to you via direct messages")
									dm.send(s)
								})
							} else {
								message.channel.send("Game idea #" + input[1] + " not found")	
							}
						})
					}
				} else {
					message.channel.send("This is a command only for moderators")
				}
			}
		}
		
	}
});

function UpdateGameIdeaBoard(){
	get(ref(db,'gameIdeas/')).then((snapshot) =>{
		client.channels.fetch(listChannelID).then(channel =>{
			if(snapshot.exists()){
				let data = snapshot.val()
				for(let i in data){
					let idea = data[i]
					let s = "<@" + idea.creator + ">\n"
					s += "```\n"
					s += "#" + (idea.number + 1) + ": " + idea.name
					s += "\nBy " + idea.creatorUsername
					s += "\n" + idea.description +"\n"
					s += "\nLooking For:"
					s += "\nDevelopers: " + idea.team.developers
					s += "\n2D Artists: " + idea.team.twoD
					s += "\n3D Artists: " + idea.team.threeD
					s += "\nDesigners: " + idea.team.designers
					s += "\nMusicians: " + idea.team.musicians
					let count = 0;
					if(idea.votes != undefined){
						for(let i in idea.votes){
							count++;
						}
					}
					if(idea.showcase){
						s += "\n\nVotes: " + count 
					}
					s += "\n```"
					channel.messages.fetch(idea.listMessage).then(msg =>{
						msg.edit(s)
					})
				}
			}
		})
	})
}

client.on('messageReactionAdd', (reaction,user) =>{
	if(!user.bot){
		if(roleEmojiDictionary[reaction.emoji.name] != undefined){
			client.guilds.cache.get(guildID).members.cache.get(user.id).roles.add(roleEmojiDictionary[reaction.emoji.name])
			client.guilds.cache.get(guildID).members.cache.get(user.id).roles.add(participantRole)
			client.guilds.cache.get(guildID).members.cache.get(user.id).roles.add(lftRole)
		}
	}
})

client.on('messageReactionRemove', (reaction,user) =>{
	if(!user.bot){
		if(roleEmojiDictionary[reaction.emoji.name] != undefined){
			client.guilds.cache.get(guildID).members.cache.get(user.id).roles.remove(roleEmojiDictionary[reaction.emoji.name])
		}
	}
})