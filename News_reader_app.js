// Use this sample to create your own voice commands
intent('What does this app do?','What can i do here?',
      reply('This is a news project. It can provide the most recent headlines in mainstream media. You can also get news about certain topics, categories and more'));

const API_key='6e067dcaf082458da6302b8e9e627055';
let saved=[];

//news by source

intent('Give me the news from $(source* (.*))',(p)=>{
    let NEWS_API_URL = `https://newsapi.org/v2/top-headlines?apiKey=${API_key}`;
    
    if(p.source.value){
        NEWS_API_URL = `${NEWS_API_URL}&sources=${p.source.value.toLowerCase().split(' ').join('-')}`
    }
    
    api.request(NEWS_API_URL,(error,response,body)=>{
        const {articles}=JSON.parse(body);
        
        if(!articles.length){
            p.play('Sorry, please try searching for news from a different source.');
            return;
        }
        saved=articles;
        p.play({command:'newHeadlines',articles});
        p.play(`Here are the (latest|recent) news from ${p.source.value}.`)
        
        p.play('Would you like me to read the headlines?');
        p.then(confirmation);
    })
})

//news by term

intent('what\'s up with $(term* (.*))', (p) => {
    let NEWS_API_URL = `https://newsapi.org/v2/everything?apiKey=${API_key}`;
    
    if(p.term.value) {
        NEWS_API_URL = `${NEWS_API_URL}&q=${p.term.value}`
    }
    
    api.request(NEWS_API_URL, (error, response, body) => {
        const { articles } = JSON.parse(body);
        
        if(!articles.length) {
            p.play('Sorry, please try searching for something else.');
            return;
        }
        
        saved = articles;
        
        p.play({ command: 'newHeadlines', articles });
        p.play(`Here are the (latest|recent) articles on ${p.term.value}.`);
        
        p.play('Would you like me to read the headlines?');
        p.then(confirmation);
    });
})

const CATEGORIES = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
const CATEGORIES_INTENT = `${CATEGORIES.map((category) => `${category}~${category}`).join('|')}|`;

intent(`(show|what is|tell me|what's|what are|what're|read) (the|) (recent|latest|) $(N news|headlines) (in|about|on|) $(C~ ${CATEGORIES_INTENT})`,
  `(read|show|get|bring me|give me) (the|) (recent|latest) $(C~ ${CATEGORIES_INTENT}) $(N news|headlines)`, (p) => {
    let NEWS_API_URL = `https://newsapi.org/v2/top-headlines?apiKey=${API_key}&country=us`;
    
    if(p.C.value) {
        NEWS_API_URL = `${NEWS_API_URL}&category=${p.C.value}`
    }
    
    api.request(NEWS_API_URL, (error, response, body) => {
        const { articles } = JSON.parse(body);
        
        if(!articles.length) {
            p.play('Sorry, please try searching for a different category.');
            return;
        }
        
        saved = articles;
        
        p.play({ command: 'newHeadlines', articles });
        
        if(p.C.value) {
            p.play(`Here are the (latest|recent) articles on ${p.C.value}.`);        
        } else {
            p.play(`Here are the (latest|recent) news`);   
        }
        
        p.play('Would you like me to read the headlines?');
        p.then(confirmation);
        
    });
});

const confirmation = context(() => {
    intent('yes', async (p) => {
        p.play('Sure, you can stop me anywhere by clicking on the alan button below.')
        for(let i = 0; i < saved.length; i++){
            p.play({ command: 'highlight', article: saved[i]});
            p.play(`${saved[i].title}`);
        }
    })
    
    intent('no', (p) => {
        p.play('Sure, sounds good to me.')
    })
})

intent('open (the|) article number $(number* (.*))',(p)=>{
    if(p.number.value){
        p.play({command:'open',number:p.number.value,articles:saved})
    }
})

intent('(go|) back', (p) => {
    p.play('Sure, going back');
    p.play({ command: 'newHeadlines', articles: []})
})
