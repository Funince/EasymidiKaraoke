<template>
    <div>
        <button @click="izquierda"> < </button>
  <div ref="scroll" id="scroll"></div>
  <button @click="derecha">> </button>
    </div>
 
</template>
<script>
import * as d3 from 'd3'
export default {
    name: 'estilogrilla',
    props: {
        estilogrilla: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            estilogrilla: 'estilogrilla',
            svg:null,
            scroll:null,
            thumb:null,
            zoom : null,
            currenttransform:d3.zoomIdentity,
            widthhumb:0,
            width:800,
            height:10
        }
    },
    methods: {
        createscroll() {
            let scroll=this.$refs.scroll
           this.width=scroll.clientWidth
            this.svg = d3.select(scroll)
                .append('svg')
                .attr('width', scroll.clientWidth)
                .attr('height', 10)
                .style('width', '100%')
                            
            this.svg.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', scroll.clientWidth)
                .attr('height', 10)
                .attr('fill', 'white')
        },
        updatescroll(){
            if (!this.svg) return;
            let scroll=this.$refs.scroll
            this.width=scroll.clientWidth
          this.svg.attr('viewbox', `0 0 ${this.width} ${this.height}`)
          this.svg.select('rect').attr('width', this.width)
        },
        createthumb(){
          this.widthhumb=100
          this.thumb = this.svg.append('g')
          this.thumb.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', this.widthhumb)
          .attr('height', 10)
          .attr('fill', 'gray')

        let width = this.svg.attr('width')
        let prueba=width-this.widthhumb
        console.log('width',width,"prueba",prueba)
        this.zoom = d3.zoom()
        .scaleExtent([1, 1])
        .extent([[prueba, 0], [0, 10]])
        .translateExtent([[0, 0], [0, 10]])
          .on('zoom', this.zoomed)
          this.svg.call(this.zoom)
        },
        zoomed(event) {
          const { transform } = event
          
          transform.y=0
          transform.k=1
          this.currenttransform=transform
          console.log('transform',transform)
          this.thumb.attr('transform', transform)
          /* this.thumb.attr('transform', transform) */
          
         /*  console.log("debe moverse",transform) */
        } ,
         izquierda(){
          console.log('izquierda')
          console.log(this.currenttransform)
          this.currenttransform=this.currenttransform.translate(-10,0)
          this.thumb.attr('transform', this.currenttransform)},
          derecha(){
            console.log('derecha')
            this.currenttransform=this.currenttransform.translate(10,0)
            this.thumb.attr('transform', this.currenttransform)
          }

    },
    mounted() {
    this.createscroll()
    this.updatescroll()
    let currentTransform = d3.zoomIdentity
    currentTransform.y=0
    this.currenttransform=currentTransform
    this.createthumb()
    /* this.updatescroll() */
    window.addEventListener('resize', () => {

  
      this.updatescroll()
    
    }) 
}
}

</script>
<style scoped>
#scroll {
    width: 100%;
    height: 10px;
    padding: 0%;
    margin: 0%;
}
svg{
  padding: 0;
  margin: 0;
  border: 0;

}
</style>