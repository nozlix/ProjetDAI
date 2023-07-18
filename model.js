//-------------------------------------------------------------------- Model ---
  // Unique source de vérité de l'application
  //
  
  const initialModel= {
    authors  : ['Jonathan DERREZ', 'Sabrina LAVERGNE'],
    artiPart1: [],
    artiPart2: [],
    articles : {
      values : [],
      hasChanged : true,
    },
    categories: [],
    origins   : [],
    
    filters: {
      categories:{
        booleans: {}, // filtre actif ou non pour chaque catégorie
        count   : {}, // nombre d'articles de chaque catégorie
      },
      origins:{
        booleans: {},
        count   : {},
      },
      search : {
        global: false, // recherche sur tous les articles ou seulement les articles filtrés
        text  : 'a',   // texte recherché
      },
    },
    settings : {
      articleImages: true,
      animations   : true,
      darkTheme    : false,
    },
    display : {
      cartView     : true,   // panier visible ou non
      articlesView : 'grid', // affichage en 'grid' ou 'list'
    },
    pagination: {
      grid: {
        currentPage : 1,
        linesPerPage: 1,
        linesPerPageOptions: [1,2,3],
      },
      list: {
        currentPage : 1,
        linesPerPage: 6,
        linesPerPageOptions : [3,6,9],
      },
    },
    
    cartSort : {
      property  : 'name',   // tri du panier selon cette propriété
      ascending : {         // ordre du tri pour chaque propriété
        name    : true,
        quantity: true,
        total   : true,
      },  
      hasChanged: true,
    },  
  };

samModel = {

    model: initialModel,
  
    // Demande au modèle de se mettre à jour en fonction des données qu'on
    // lui présente.
    // l'argument data est un objet confectionné dans les actions.
    // Les propriétés de data désignent la modification à faire sur le modèle.
    samPresent(data) {
      switch (data.do) {
        case 'init': {
          console.log('samModel.init');
          // this.model.artiPart1 = data.artiPart1;
          // this.model.artiPart2 = data.artiPart2;
          this.modelAssign('artiPart1', data.artiPart1);
          this.modelAssign('artiPart2', data.artiPart2);
          this.createArticles();
          this.extractCategories();
          this.extractOrigins();
        } break;
        
        case 'viewCartToggle'    : this.modelToggle('display.cartView');       break;
        case 'imagesToggle'      : this.modelToggle('settings.articleImages'); break;
        case 'animationsToggle'  : this.modelToggle('settings.animations'   ); break;
        case 'darkThemeToggle'   : this.modelToggle('settings.darkTheme'    ); break;      
        case 'gridListView'      : this.modelAssign('display.articlesView', data.view); break;      
        
        case 'updatePagination'  : break;      
        case 'filt' :
          if(data.name != 'toute'){
            this.modelToggle(`filters.${data.nameFilt}.booleans.${data.name}`)
          }
          else{
            if(data.e.target.checked){
              this.model[data.nameFilt].forEach((v)=> {
                this.model.filters[data.nameFilt].booleans[v] = true
              })
            }
            else{
              this.model[data.nameFilt].forEach((v)=> {
                this.model.filters[data.nameFilt].booleans[v] = false
              })
            }
          }
          
          break;
        case 'globalToggle' :
          this.modelToggle('filters.search.global')
          

          break;
        case 'search' :
          this.modelAssign('filters.search.text', data.e.target.value)
          
          break;
        case 'removeSearch' :
          this.modelAssign('filters.search.text', '')
          break;
        case 'changePage' :
          if(data.direction == 'prev'){
            this.model.pagination[data.view].currentPage--;
          }
          else if(data.direction == 'next'){
            this.model.pagination[data.view].currentPage++;
          }
          else {
            //this.modelAssign(`pagination['grid'].currentPage`, data.direction)
            this.model.pagination[data.view].currentPage = data.direction;
            
            }
          
          break;

        case 'changeLinesPerPage' :
          
          this.model.pagination[data.view].linesPerPage = data.e.target.value
          break;
        case 'changeQuantity' : 
          if(data.e.target.value.replace( /[^\d].*/, '' )  !=''){
            this.model.articles.values[data.index].quantity = data.e.target.value.replace( /[^\d].*/, '' )
          }
          if(this.model.articles.values[data.index].quantity == 0) this.model.articles.values[data.index].inCart=false
          this.model.articles.hasChanged = true
          this.model.cartSort.hasChanged = true
          
          break;
        case 'pushToCart' :
          this.model.articles.values[data.index].inCart=true
          this.model.articles.hasChanged = true
          this.model.cartSort.hasChanged = true
          break;
        case 'cartToggle' :
          this.model.articles.values.forEach((v) =>{
            if(v.id == data.id){
              v.checked = data.e.target.checked
            }
          })
          
          this.model.articles.hasChanged = true;
          this.model.cartSort.hasChanged = true;
          
          break;
        case 'cartDelete' :
          this.model.cartSort.deleteOn = true;
          this.model.articles.hasChanged = true
          this.model.cartSort.hasChanged = true
          break;
        case 'sortCart' :

          console.log("this !!!", this.model.cartSort.lastProperty  )
          this.modelAssign('cartSort.property', data.property);
          if(this.model.cartSort.lastProperty == data.property || this.model.cartSort.lastProperty == undefined) this.modelToggle(`cartSort.ascending.${data.property}`)

          this.model.cartSort.lastProperty = data.property
          this.model.articles.hasChanged = true;
          this.model.cartSort.hasChanged = true
          break;


        
        default : 
          console.error('samPresent() - proposition non prise en compte : ', data);
          return;
      }
  
      // Demande à l'état de l'application de prendre en compte la modification
      // du modèle
      samState.samUpdate(this.model);
      
      this.model.articles.hasChanged = false;
      this.model.cartSort.hasChanged = false;
    },
    
    /**
     * Cadeau : Affecte value à la propriété propertyStr
     * 
     * modelToggle('display.cartView'); 
     * est équivalent à :
     * this.model.display.cartView = !this.model.display.cartView;
     * 
     * Intérêt : plus compact et un message d'erreur est envoyé si le nom de la proprité est incorrecte
     * ou si les types sont différents.
     *
     * @param {string} propertyStr 
     * @param {any}    value 
     */
     modelToggle(propertyStr) {
      const root = 'model';
      const path = propertyStr.split('.');
      let val = this[root];
      let pathNames = ['this',root];
      path.some((v, i, a) => {
        pathNames.push(v);
        if (val[v]===undefined) {
          console.error(`modelToggle(${propertyStr}) : ${pathNames.join('.')} is undefined`);
          return true;
        }
        if (i < a.length - 1) { 
          val = val[v]; 
        } else {
          if (typeof val[v] != undefined && typeof val[v] != 'boolean') {
            console.error(`modelToggle(${propertyStr}) : ${pathNames.join('.')} is not a boolean`);
            return true;
          };
          val[v] = !val[v];
        }
      });
    },
    /**
     * Cadeau : Transforme une propriété booléenne en son opposée (true -> false, false -> true)
     * 
     * this.modelAssign('artiPart1', data.artiPart1);
     * est équivalent à :
     * this.model.artiPart1 = data.artiPart1;
     *
     * Intérêt : un message d'erreur est envoyé si le nom de la proprité est incorrecte
     * ou si elle n'est pas de type booléen.
     *
     * @param {string} propertyStr 
     */
     modelAssign(propertyStr, value) {
      const root = 'model';
      const path = propertyStr.split('.');
      let val = this[root];
      let pathNames = ['this',root];
      path.some((v, i, a) => {
        pathNames.push(v);
        if (val[v]===undefined) {
          console.error(`modelToggle(${propertyStr}) : ${pathNames.join('.')} is undefined`);
          return true;
        }
        if (i < a.length - 1) { 
          val = val[v]; 
        } else {
          if (typeof val[v] != undefined && typeof val[v] !== typeof value) {
            console.error(`modelToggle(${propertyStr}) : ${pathNames.join('.')} (${typeof val[v]}) is not of the same type of ${value} (${typeof value})`);
            return true;
          };
          val[v] = value;
        }
      });
    },
    
    /**
     * fonction à passer en paramete à Array.sort() pour trier un tableau d'objets
     * selon leur nom, et leur prix s'il ont le même nom.
     *
     * @param {Object} a 
     * @param {Object} b 
     * @returns -1 or 0 or 1
     */
    articlesSort(a,b) {
      if (a.name <b.name ) return -1;
      if (a.name >b.name ) return  1;
      if (a.price<b.price) return -1;
      if (a.price>b.price) return  1;
      return 0;  
      
    },
    
    /**
     * Création des articles à partir des deux fichiers de données (ArtiPart1 et ArtiPart2).
     *
     * Ce sont ces articles que l'interface graphique va représenter. 
     */
    createArticles() {
      const artiPart1 = this.model.artiPart1;
      const artiPart2 = this.model.artiPart2;
      
      let articleId = 0;
      
      const articles = artiPart1.map((a1)=>{
        
        const articlesTmp = artiPart2.filter((a) => a.id == a1.id).map((a2)=>{
          
          const article = {
            id      : articleId,  // création d'un identifiant unique pour chaque article
            // from artiPart2
            name    : a2.name,
            category: a2.category,
            pictures: a2.pictures,
            // from artiPart1
            origin  : a1.origin,
            price   : a1.price,
            unit    : a1.unit,
            quantity: a1.quantity,
            inCart  : a1.inCart,
          };
          articleId++;
          
          return article; 
        });
        return articlesTmp[0];
      });
      this.model.articles.values = articles.sort(this.articlesSort);  // articles triés
      this.model.articles.hasChanged = true;
    },
    
    /**
     * Pour un tri par ordre alphabétique
     * 
     */
    /* alphaSort(a,b) {
      
      // TODO
  
      return 1;  
    }, */
    
    /**
     * Extraction :
     * - des catégories présentes dans la liste d'articles    --> model.categories
     * - du nombre d'articles appartenant à chaque catégories --> model.filters.categories.count
     *      model.filters.categories.count['fruits'] === 5
     * - du tableau de booléens pour l'état du filtre sur les catégories --> model.filters.categories.booleans
     *      model.filters.categories.booleans['fruits'] === true
     *
     * Les catégories sont triées par ordre alphabétique
     */

    extractCategories() {
      
      const articles   = this.model.articles.values;
      console.log(articles)
      const categories = [];
      const catsCount  = {};
      const catsFilter = {};
      articles.forEach( function(v,i,a) {

        if(!categories.includes(v.category)){
          categories.push(v.category);
          catsCount[v.category] = 1;
          catsFilter[v.category] = true;
        }
        else catsCount[v.category] ++;
      })
      

      
      
      categories.sort();
      this.model.categories = categories;
      this.model.filters.categories.count  = catsCount;
      this.model.filters.categories.booleans = catsFilter;
    },
    
    extractOrigins() {
      const articles   = this.model.articles.values;
      const origin = [];
      const catsCount  = {};
      const catsFilter = {};
      articles.forEach( function(v,i,a) {

        if(!origin.includes(v.origin)){
          origin.push(v.origin);
          catsCount[v.origin] = 1;
          catsFilter[v.origin] = true;
        }
        else catsCount[v.origin] ++;
      })
      

      
      
      origin.sort();
      this.model.origins = origin;
      this.model.filters.origins.count  = catsCount;
      this.model.filters.origins.booleans = catsFilter;
    },
  };
  