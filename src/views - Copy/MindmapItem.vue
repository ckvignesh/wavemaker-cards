// TODO : Add the text node
// TODO : Add the Image node
// TODO : Needs to be looked at for speed

<template>
  <div class="wm_scrollwindow">
    <div no-gutters align="center" justify="center" class="sticky" color="c9">
      <div cols="12">
        <input type="text"
          v-model="$root.shadowDB.Mindmap[$route.params.id].title"
          @change="SaveChange()"
        />
      </div>
    </div>
    <div id="scroller" @mousemove="DrawingLine()">
      <div class="lineDrawing" :style="DrawLineStyle"></div>

      <template
        v-for="links in Object.entries(
          $root.shadowDB.Mindmap[$route.params.id].content
        )"
      >
        <div
          v-for="(lineitem, index) in Object.entries(links[1].linksOut)"
          :key="index + links[0]"
          class="lineDraw"
          @click="DeleteLink(links[0], lineitem[0])"
          :style="lineStyle(links[0], lineitem[0])"
        ></div>
      </template>
      <template
        v-for="item in Object.entries(
          $root.shadowDB.Mindmap[$route.params.id].content
        )"
      >
        <vue-draggable-resizable
          :key="item[0]"
          :parent="false"
          :w="item[1].width"
          :h="item[1].height"
          @activated="onActivated(item)"
          @deactivated="onDeactivated(item[0])"
          @dragging="onDrag"
          @resizing="onResize"
          class="card"
          :x="item[1].x"
          :y="item[1].y"
          drag-handle=".drag"
          :class="currentitem[0] === item[0] ? 'tophover' : ''"
        >
          <div 
            :width="item[1].width"
          >
            <div class="drag">
              <i class="mdi mdi-drag md-24"></i>
            </div>

            <p v-if="item[1].type==='text'"  
              :class="[
            (item[0]===currentitem[0]) ? 'active' : 'faded',]">
          <textarea
          value="The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through."
          v-model="item[1].content"
            rows="1"
            @blur="SaveChange()"
        ></textarea>
               
   
            </p>
        
              <button class="button is-small is-success" @click="createLink(item)"
                ><i class="mdi mdi-link md-18"></i></button
              >

              <button class="button is-small is-danger" @click="DeleteNode(item)"
                ><i class="mdi mdi-delete md-18"></i></button
              >
         
          </div>
        </vue-draggable-resizable>
      </template>
    </div>
    <button class="button is-small is-success" @click="AddNode()"
      ><i class="mdi mdi-plus md-18"></i></button
    >
  </div>
</template>

<script>
import VueDraggableResizable from "vue-draggable-resizable";
// optionally import default styles
//import "vue-draggable-resizable/dist/VueDraggableResizable.css";
export default {
  components: {
    VueDraggableResizable,
  },
  data() {
    return {
      createlink: null,
      currentitem: [],
      DrawLineStyle: { top: "-10000px" },
      LastNodePos : null
    };
  },
  methods: {
    createLink(item) {
      if (this.createlink === null) {
        this.createlink = item;
      } else {
        if (this.createlink != item) {
          let start = this.createlink;
          let end = item;
          this.$set(
            this.$root.shadowDB.Mindmap[this.$route.params.id].content[start[0]]
              .linksOut,
            end[0],
            1
          );
          this.$set(
            this.$root.shadowDB.Mindmap[this.$route.params.id].content[end[0]]
              .linksIn,
            start[0],
            1
          );
          console.log("create", start, end);
          this.createlink = null;

          this.SaveChange();
        } else {
          this.createlink = null;
        }
        // else - its the same link
      }
    },

    DeleteLink(src, target) {
      this.$delete(
        this.$root.shadowDB.Mindmap[this.$route.params.id].content[src]
          .linksOut,
        target
      );
      this.$delete(
        this.$root.shadowDB.Mindmap[this.$route.params.id].content[target]
          .linksIn,
        src
      );
      this.SaveChange();
    },

    DrawingLine() {
      if (this.createlink) {
        var off1 = this.createlink[1];

        var rect = document.getElementById("scroller").getBoundingClientRect();

        // center of first point
        var dx1 = off1.x + off1.width / 2;
        var dy1 = off1.y + off1.height / 2;
        // center of second point
        var dx2 = event.clientX - rect.left;
        var dy2 = event.clientY - rect.top;
        // distance
        var length = Math.sqrt(
          (dx2 - dx1) * (dx2 - dx1) + (dy2 - dy1) * (dy2 - dy1)
        );
        // center
        var cx = (dx1 + dx2) / 2 - length / 2;
        var cy = (dy1 + dy2) / 2 - 2 / 2;
        // angle
        var angle = Math.atan2(dy1 - dy2, dx1 - dx2) * (180 / Math.PI);
        // draw line

        var o = {
          top: cy + "px",
          left: cx + "px",
          width: length + "px",
          transform: "rotate(" + angle + "deg)",
        };

        this.DrawLineStyle = o;
      } else {
        this.DrawLineStyle = { top: "-10000px" };
      }
    },
    lineStyle(src, target) {
      var off1 = this.$root.shadowDB.Mindmap[this.$route.params.id].content[
        src
      ];
      var off2 = this.$root.shadowDB.Mindmap[this.$route.params.id].content[
        target
      ];
      // center of first point
      var dx1 = off1.x + off1.width / 2;
      var dy1 = off1.y + off1.height / 2;
      // center of second point
      var dx2 = off2.x + off2.width / 2;
      var dy2 = off2.y + off2.height / 2;
      // distance
      var length = Math.sqrt(
        (dx2 - dx1) * (dx2 - dx1) + (dy2 - dy1) * (dy2 - dy1)
      );
      // center
      var cx = (dx1 + dx2) / 2 - length / 2;
      var cy = (dy1 + dy2) / 2 - 2 / 2;
      // angle
      var angle = Math.atan2(dy1 - dy2, dx1 - dx2) * (180 / Math.PI);
      // draw line

      var o = {
        top: cy + "px",
        left: cx + "px",
        width: length + "px",
        transform: "rotate(" + angle + "deg)",
      };

      return o;
    },

    onActivated(i) {
      this.currentitem = i;
      this.LastNodePos = i
     //   console.log("selected", i);
    },
    onDeactivated() {
    //   console.log("Deactivated Node");
      this.$set(
        this.$root.shadowDB.Mindmap[this.$route.params.id].content,
        this.currentitem[0],
        this.currentitem[1]
      );
      this.SaveChange();
      this.currentitem = [];
    },
    onResize: function (x, y, width, height) {
      this.currentitem[1].x = x;
      this.currentitem[1].y = y;
      this.currentitem[1].width = width;
      this.currentitem[1].height = height;
      this.$set(
        this.$root.shadowDB.Mindmap[this.$route.params.id].content,
        this.currentitem[0],
        this.currentitem[1]
      );
    },
    onDrag: function (x, y) {
      if (x < 10 || y < 10) {
        return false;
      } // prevent them dropping a card off the top or left
      this.currentitem[1].y = y;
      this.currentitem[1].x = x;
      this.$set(
        this.$root.shadowDB.Mindmap[this.$route.params.id].content,
        this.currentitem[0],
        this.currentitem[1]
      );
    },
    DeleteNode(item) {
      // we need to delete the linksOut to this node from any other nodes
      let deleteUid = item[0];
      Object.entries(
        this.$root.shadowDB.Mindmap[this.$route.params.id].content
      ).forEach((element) => {
        this.$delete(element[1].linksOut, deleteUid);
      });
      this.$delete(
        this.$root.shadowDB.Mindmap[this.$route.params.id].content,
        deleteUid
      );
      this.SaveChange();
    },
    AddNode() {
      console.log("lastpos ",this.LastNodePos)
      let startx = 10;
      let starty = 10;
      let startWidth = 300
      let startHeight = 200
      if(this.LastNodePos){
          startx = this.LastNodePos[1].x + 10 + this.LastNodePos[1].width
          starty = this.LastNodePos[1].y
      }
        this.LastNodePos = null  // not actually essential but will make the position reset after each addition if no selection made
      let uuid = this.$root.uuid.v4();
      let n = {
        x: startx,
        y: starty,
        width: startWidth,
        height: startHeight,
        type : 'text', 
        content : '',
        linksIn: {},
        linksOut: {},
      };
      // console.log(uuid, n);

      this.$set(
        this.$root.shadowDB.Mindmap[this.$route.params.id].content,
        uuid,
        n
      );
      this.SaveChange();
    },
    SaveChange() {
      this.$root.UpdateRecord(
        "Mindmap",
        this.$route.params.id,
        this.$root.shadowDB.Mindmap[this.$route.params.id]
      );
    },
  },
    beforeMount() {
    this.$root.showNavigation = true;
  },
};
</script>

<style scoped >
.fab-container {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 100%;
}
.lineDraw {
  position: absolute;
  background-color: var(--c6);
  height: 5px;
  cursor: pointer;
}

.lineDrawing {
  position: absolute;
  background-color: var(--c6);
  height: 2px;
}

#scroller {
  position: absolute;
  top: 50px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  overflow: scroll;
}
.card {
  position: absolute;
}
.tophover {
  z-index: 999999 !important;
}
.drag {
  text-align: right;
  cursor: pointer;
  top:0px;

  width:100%
}

.active{
  opacity: 1;
}
.faded{
  opacity: 0.5;
}
</style>