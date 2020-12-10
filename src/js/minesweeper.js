let mfld
let nbar
let menu
let mineFieldWidth=5
let mineFieldHeight=5
let minePercent=10

class game{
    constructor(){
        new navbar()
        new startButton()
        new sizeSelect()
        new modeSelect() 
        mfld=new mineField(mineFieldWidth,mineFieldHeight,minePercent)       
    }
    
    static changeMode(){
        document.querySelector('.wrapper').remove()
        mfld=new mineField(mineFieldWidth,mineFieldHeight,minePercent)
    }
}

class navbar{
    constructor(){
        nbar=document.createElement('div')
        nbar.classList.add('navbar')
        document.querySelector('body').appendChild(nbar)
        let h1=document.createElement('h1')
        h1.textContent="Minesweeper"
        nbar.appendChild(h1)
        menu=document.createElement('div')
        menu.classList.add('menuwrapper')
        nbar.appendChild(menu)        
    }
}

class startButton{
    constructor(){
        let stbtn=document.createElement('input')
        stbtn.classList.add('startbtn')
        stbtn.setAttribute('type','button')
        stbtn.value="Start"
        stbtn.textContent="Minesweeper"
        stbtn.addEventListener('click',()=> mfld.newGame())
        menu.appendChild(stbtn)        
    }
}

class sizeSelect{
    constructor(){
        let sisel=document.createElement('select')
        sisel.classList.add('sizesel')
        sisel.addEventListener('change',()=> this.changeSide(sisel.selectedIndex))
        menu.appendChild(sisel)
        let opt=document.createElement('option') 
        opt.textContent='Small'
        sisel.appendChild(opt)
        opt=document.createElement('option') 
        opt.textContent='Medium'
        sisel.appendChild(opt)
        opt=document.createElement('option') 
        opt.textContent='Large'
        sisel.appendChild(opt) 
    }

    changeSide(s){
        switch (s) {            
            case 1:
                mineFieldWidth=15
                mineFieldHeight=15            
                break;                                            
            case 2:
                mineFieldWidth=25
                mineFieldHeight=25
                break;                
            default:
                mineFieldWidth=5
                mineFieldHeight=5
                break;
        }     
        game.changeMode()
    }
}

class modeSelect{
    constructor(){
        let mdsel=document.createElement('select')
        mdsel.classList.add('modesel')
        mdsel.addEventListener('change',()=> this.changeMode(mdsel.selectedIndex))        
        menu.appendChild(mdsel)
        let opt=document.createElement('option') 
        opt.textContent='Easy'
        mdsel.appendChild(opt)
        opt=document.createElement('option') 
        opt.textContent='Medium'
        mdsel.appendChild(opt)
        opt=document.createElement('option') 
        opt.textContent='Hard'
        mdsel.appendChild(opt) 
    }

    changeMode(s){     
        switch (s) {
            case 1:
                minePercent=20            
                break;                                            
            case 2:
                minePercent=25
                break;                
            default:
                minePercent=10
                break;
        }            
        game.changeMode()
    }
}

class mineField{
    constructor(fieldwidth, fieldheight, minepercent){
        this.fieldwidth=fieldwidth
        this.fieldheight=fieldheight
        this.fieldNumber=this.fieldwidth*this.fieldheight
        this.hiddenFields=this.fieldNumber
        this.numberOfMines=(this.fieldNumber*(minepercent/100)).toFixed(0)
        this.fields={};
        this.init()
        console.log(this.numberOfMines)
    }
    
    init(){
        const wrapper=document.createElement('div')
        wrapper.classList.add('wrapper')
        document.querySelector('body').appendChild(wrapper)
        const mfield=document.createElement('div')
        mfield.classList.add('minefield')
        wrapper.appendChild(mfield)
        mfield.style.gridTemplateRows=`repeat(${this.fieldheight},20px)`
        mfield.style.gridTemplateColumns=`repeat(${this.fieldwidth},20px)`    
    
        for(let i=0;i<this.fieldheight;i++){
            for(let j=0;j<this.fieldwidth;j++){
                let par=new field()
                par.id=`${i}.${j}`
                this.fields[par.id]=par
                par.hideField()
                mfield.appendChild(par.div)
            }
        }     
    }

    newGame(){
        this.hiddenFields=this.fieldNumber
        Object.entries(this.fields).map(d=> {
            let fld=this.fields[d[0]]
            fld.mined=false
            fld.div.classList.remove('mine','flag')
            fld.hideField()
        })
    }

    gameOver(res){
        console.log(res ? 'You have won!' : 'Bumm! You have lost!')
        Object.entries(this.fields).map(d=> 
            this.fields[d[0]].div.classList.remove('hide','flag'))
    } 

    checkIfWin(){
        if(mfld.hiddenFields==mfld.numberOfMines) this.gameOver(true)
    }

    getRandomInt(min,max) {
        min=Math.ceil(min);
        max=Math.floor(max);
        return Math.floor(Math.random()*(max-min)+min);
    }
    
    getNeighbors(f){
        const ar=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]
        let selfPos=f.id.split('.').map(d=>{
            return parseInt(d);
        })
        return ar.map(d=>{
            let x=selfPos[0]+d[0]
            let y=selfPos[1]+d[1]
            if((x>=0 && x<this.fieldwidth) && (y>=0 && y<this.fieldheight)){
                return `${x}.${y}`
            }
        }).filter(f=> f!==undefined)
    }

    plantMines(f){
        let savedPlace=this.getNeighbors(f)
        savedPlace.push(f.id)
        let i=0    
        while (i < this.numberOfMines) {
            let x=this.getRandomInt(0,this.fieldwidth) 
            let y=this.getRandomInt(0,this.fieldheight)
            let pos=`${x}.${y}`
            let p=this.fields[pos]
            if(p.mined==false && !savedPlace.includes(pos)){
                p.mined=true
                p.div.classList.add('mine')
                i++
            }
        }
    }

    checkNeighbors(f){
        if(f.hidden==false) return false 
        let mine=0
        let n=this.getNeighbors(f)            
        let res=n.map(d=>{
            let p=this.fields[d]
            if(p.mined) mine++
            else return p
        })
        f.unhideField()
        if(mine>0) f.div.textContent=mine
        else if(res.length>0) res.map(d=>this.checkNeighbors(d))
    }
}

class field{
    constructor(){
        this.id='';
        this.hidden=false
        this.flagged=false
        this.mined=false
        this.div=document.createElement('div') 
        this.div.classList.add('field') 
        this.div.addEventListener('click',()=> this.stepOnField(this))
        this.div.addEventListener('contextmenu',(e)=>{
            this.toggleFlag()
            e.preventDefault()
        })            
    }

    stepOnField(f){
        if(!this.div.classList.contains('hide')) return false  // nem működik a this.hidden
        if(mfld.hiddenFields==mfld.fieldNumber) mfld.plantMines(this)
        if(f.mined) mfld.gameOver(false)
        else{  
            mfld.checkNeighbors(this)
            mfld.checkIfWin()
        }
        
    }

    toggleFlag(){
        if(this.div.classList.contains('hide')){
            this.flagged ? this.flagged=false : this.flagged=true
            this.div.classList.toggle('flag')
        }
    }

    hideField(){
        this.hidden=true
        this.div.textContent=""
        this.div.classList.add('hide')
    }

    unhideField(){
        this.hidden=false
        this.div.classList.remove('hide')
        mfld.hiddenFields--
        if(this.flagged) this.toggleFlag()
    }
}

export {
    game
}