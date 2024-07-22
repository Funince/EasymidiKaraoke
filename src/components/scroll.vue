<template>
    <div class="scroll-box" :style="{ height: `${contentHeight}px` }">
        <div class="content2" ref="content">
            <!-- Aquí se agregarán los dibujos de D3.js -->
        </div>
    </div>
</template>

<script>
import * as d3 from 'd3';
import { ref } from 'vue';
export default {
    name: 'ScrollableDiv',
    data() {
        return {
            contentHeight:200
        };
    },
    mounted() {
        this.createD3Drawings();
    },
    methods: {
        createD3Drawings() {
            const content = d3.select(this.$refs.content);
            // Altura total del contenido
            // Agregar SVG para los dibujos
            const svg = content.append('svg')
                .attr('width', 300) // Ancho del área visible
                .attr('height', 600) // Altura total para permitir el desplazamiento
                .style('background-color', '#f9f9f9')

                .style('style', 'max-width:100%;height:auto;')
                .call(d3.zoom().scaleExtent([0.1, 8])
                    .extent([[0, 0], [300, 600]])
                    .translateExtent([[0, 0], [300, 600]])
                    .on('zoom', (event) => {

                        svg.attr('transform', event.transform);
                    }))
                .append('g'); // Agrupar elementos para aplicar zoom

            // Ejemplo de agregar círculos con D3.js
            svg.selectAll('circle')
                .data(d3.range(20)) // Simula 20 elementos
                .enter()
                .append('circle')
                .attr('cx', 150)
                .attr('cy', (d, i) => i * 30 + 30) // Espaciado vertical
                .attr('r', 15)
                .attr('fill', 'steelblue');
        }
    }
};
</script>

<style scoped>
.scroll-box {
    width: 300px;
    overflow: scroll;
    


}

.content2 {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0px;

    width: 100%;
}
</style>