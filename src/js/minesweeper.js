window.addEventListener('DOMContentLoaded',()=> new game())

let mfld

let fieldSizes=[
    {title: 'Tiny', size: 5},
    {title: 'Small', size: 10},
    {title: 'Medium', size: 15},
    {title: 'Large', size: 25}
]

let minePercents=[
    {title: 'Easy', perc: 10},
    {title: 'Moderate', perc: 20},
    {title: 'Hard', perc: 25}
]

let sizes=5
let mines=10

class game{
    constructor(){
        new navbar()
        mfld=new mineField(5,10)
    }

    static changeMode(){
        document.querySelector('.minefield').remove()
        mfld=new mineField(sizes,mines)
        document.querySelector('h3').innerText=`${mfld.numberOfMines} mines left`
    }
}

class navbar{
    constructor(){
        document.querySelector('body').innerHTML=
            `<div class="navbar">
                <div class="title">
                    <h1>Minesweeper</h1>
                </div>
                <div class="menuwrapper">
                    <input class="startbtn" type="button" value="New game"></input>
                    <select class="sizeselect"></select>
                    <select class="modeselect"></select>                    
                </div>
            </div>
            <div class="textwrapper">
                <h3>10 mines</h3>
            </div>
            <div class="wrapper">
                <input class="flagbtn" type="button" value="Flag"></input>
            </div>`

            document.querySelector('.startbtn').addEventListener('click',()=> mfld.newGame())
            let size=document.querySelector('.sizeselect')
            size.addEventListener('change',(e)=> this.changeSize(e.target.value))
            fieldSizes.map(d=>{ size.insertAdjacentHTML('beforeend',
                `<option value="${d.size}">${d.title}</option>`)
            })     
            let mode=document.querySelector('.modeselect')
            mode.addEventListener('change',(e)=>  this.changeMode(e.target.value))
            minePercents.map(d=>{ mode.insertAdjacentHTML('beforeend',
                `<option value="${d.perc}">${d.title}</option>`)
            })                            
            document.querySelector('.flagbtn').addEventListener('click',(e)=>{
                e.target.classList.toggle('flagged')
            });
            window.matchMedia('(max-width: 520px)').addEventListener("change",()=> 
                this.changeToBasicSize())
    }

    changeToBasicSize(){
        if(sizes>2){
            document.querySelector('.sizeselect').selectedIndex=2
            this.changeSize(15)
        }
    }

    changeSize(s){
        sizes=parseInt(s)
        game.changeMode()
    }
    
    changeMode(s){ 
        mines=parseInt(s)
        game.changeMode()
    }
}

class mineField{
    constructor(sizes, mines){
        this.size=sizes
        this.fieldNumber=sizes**2
        this.hiddenFields=this.fieldNumber
        this.numberOfMines=(this.fieldNumber*mines/100).toFixed(0)
        this.fields={}
        this.mineStore=new Set()
        this.flagStore=new Set()
        this.init()
    }
    
    init(){
        document.querySelector('.wrapper').insertAdjacentHTML("afterbegin", 
            `<div class="minefield"></div>`);
        document.querySelector('h3').innerText=`${this.numberOfMines} mines`
        const mfield=document.querySelector('.minefield')
        mfield.style.gridTemplateRows=`repeat(${this.size},20px)`
        mfield.style.gridTemplateColumns=`repeat(${this.size},20px)`    
    
        for(let i=0;i<this.size;i++){
            for(let j=0;j<this.size;j++){
                let par=new field()
                par.id=`${i}.${j}`
                this.fields[par.id]=par
                mfield.appendChild(par.div)
            }
        }
        this.newGame()   
    }
    
    fieldStore=()=> Object.entries(this.fields).map(d=>d[0])

    addFields=([...d],...g)=> d.map(d=> this.fields[d].div.classList.add(...g))

    clearFields=([...d],...g)=> d.map(d=> this.fields[d].div.classList.remove(...g))

    displayText=(t)=> document.querySelector('h3').innerText=t

    isAllHidden=()=> mfld.hiddenFields==mfld.fieldNumber ? true : false
    
    isFinished=()=>{
        let res=this.hiddenFields==this.numberOfMines ? true : false
        if(res) this.gameOver(true)
        return res
    }
        
    newGame(){
        this.hiddenFields=this.fieldNumber
        this.mineStore.clear()
        this.flagStore.clear()
        this.clearFields(this.fieldStore(),'mine','flag')
        this.fieldStore().map(d=>this.fields[d].displayFieldText(''))
        this.addFields(this.fieldStore(),'hide')
        this.displayText(`${this.numberOfMines} mines left`)
    }
    
    gameOver(res){
        this.displayText(res ? 'Congratulation!' : 'Sorry, you have died...')
        this.clearFields(this.fieldStore(),'hide','flag')
        this.addFields(this.mineStore,'mine')
    }
    
    getRandomInt(min,max) {
        min=Math.ceil(min);
        max=Math.floor(max);
        return Math.floor(Math.random()*(max-min)+min);
    }
    
    getNeighborsCoord(f,w){ 
        const spos=f.id.split('.').map(d=>parseInt(d))
        const ar=[].concat(...[-1,1,0].map(d=>[-1,1,0].map(g=>[spos[0]+d,spos[1]+g])))
        return ar.filter(d=>d[0]>-1 && d[1]>-1 && d[0]<w && d[1]<w).map(d=>`${d[0]}.${d[1]}`)
    }
    
    plantMines(f){
        let savedPlace=this.getNeighborsCoord(f, this.size)
        let i=0    
        while (i < this.numberOfMines) {
            let x=this.getRandomInt(0,this.size) 
            let y=this.getRandomInt(0,this.size)
            let pos=`${x}.${y}`
            if(!savedPlace.includes(pos) && !this.mineStore.has(pos)){
                this.mineStore.add(pos)
                i++
            }
        }
    }

    checkNeighbors(f){
        if(!f.isHidden()) return false
        this.hiddenFields--
        if(this.isFinished()) return false
        let foundmine=0
        let n=this.getNeighborsCoord(f, this.size)
        n.pop()
        let res=n.map(d=>{
            if(this.mineStore.has(d)) foundmine++
            else return this.fields[d]
        })
        this.clearFields([f.id],'hide','flag')
        if(foundmine>0) f.displayFieldText(foundmine)
        else if(res.length>0) res.map(d=>this.checkNeighbors(d))
    }  
}

class field{
    constructor(){
        this.id='';
        this.div=document.createElement('div') 
        this.div.classList.add('field') 
        this.div.addEventListener('click',()=> this.stepOnField())
        this.div.addEventListener('contextmenu',(e)=>{
            this.toggleFlag()
            e.preventDefault()
        })            
    }
    
    stepOnField(){
        if(!this.isHidden()) return false 
        if(this.isFlagButtonChecked()) return false
        if(this.isFlagged() || this.isMine()) return false
        if(mfld.isAllHidden()) mfld.plantMines(this)
        mfld.checkNeighbors(this)
    }
    
    isHidden=()=> this.div.classList.contains('hide') ? true : false

    isFlagged=()=> this.div.classList.contains('flag') ? true : false 

    displayFieldText=(t)=> this.div.textContent=t

    isMine=()=>{
        let res=mfld.mineStore.has(this.id) ? true : false
        if(res) mfld.gameOver(false)
        return res
    }

    toggleFlag=()=>{
        if(mfld.isAllHidden() || !this.isHidden()) return false
        mfld.flagStore.has(this.id) ? mfld.flagStore.delete(this.id) : mfld.flagStore.add(this.id)
        this.div.classList.toggle('flag')
        mfld.displayText(`${mfld.numberOfMines-mfld.flagStore.size} mine(s) left`)
    }
    
    isFlagButtonChecked=()=>{
        let res=document.querySelector('.flagbtn').classList.contains('flagged') ? true : false
        if(res){
            this.toggleFlag()
            document.querySelector('.flagbtn').classList.toggle('flagged')
        }
        return res
    }
}