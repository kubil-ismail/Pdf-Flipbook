/* v 3.7.9
author http://codecanyon.net/user/creativeinteractivemedia/portfolio?ref=creativeinteractivemedia
*/
var FLIPBOOK = FLIPBOOK || {};

{ /* FLIPBOOK.PageWebGL */
    FLIPBOOK.PageWebGL = function(book, i, hard, options, preloaderMatF, preloaderMatB) {

        THREE.Object3D.call(this);
        this.book = book;
        this.index = i;
        this.pW = options.pageWidth;
        this.pH = options.pageHeight;
        this.nfacesw = options.pageSegmentsW;
        this.nfacesh = options.pageSegmentsH;

        this.mats = [];
        this.pageHardness = hard;
        this.pageThickness = hard;
        this.duration = options.pageFlipDuration;
        this.angle = .25 * Math.PI * this.pW / this.pH;
        this.force = 10;
        this.offset = 0;
        this.to = null;
        this.mod = null;
        this.bend = null;
        this.pivot = null;
        this.isFlippedLeft = false;
        this.isFlippedRight = true;
        this.flippingLeft = false;
        this.flippingRight = false;
        this.options = options

        this.showing = false

        this.preloaderMatF = preloaderMatF
        this.preloaderMatB = preloaderMatB

        //preloaderMat.side = THREE.DoubleSide

        var self = this

        if (i == 0 && this.options.cornerCurl) {
            this.nfacesw = 20
            this.nfacesh = 20

             this.cornerCurlTween = new FLIPBOOK.TWEEN.Tween(0).to(1, 1000)
            .easing(FLIPBOOK.TWEEN.Easing.Sinusoidal.Out)
            .onUpdate(function(f) {
                if(self.cornerCurl){
                    self.b2.force = f * -1.8
                    self.modF.apply()
                }
            })
            .repeat(11000)
            .start()

        }


        // this.gF = new THREE.PlaneGeometry(this.pW, this.pH, this.nfacesw, this.nfacesh)
        this.gF = new THREE.BoxGeometry(this.pW, this.pH, 0.01, this.nfacesw, this.nfacesh, 0)
        var basicMat = new THREE.MeshBasicMaterial({
            color: 0xededed
        })
        var mats = [
            basicMat,
            basicMat,
            basicMat,
            basicMat,
            preloaderMatF,
            preloaderMatB
        ]

        var mats2 = [
            basicMat,
            basicMat,
            basicMat,
            basicMat,
            basicMat,
            basicMat
        ]

        if (this.options.pagePreloader)
            var mats2 = [
                basicMat,
                basicMat,
                basicMat,
                basicMat,
                preloaderMatF,
                preloaderMatB
            ]



        // var basicMat2 = new THREE.MeshBasicMaterial({
        //     color: 0xFF0000
        // })

        // var mats3 = [
        //     basicMat2,
        //     basicMat2,
        //     basicMat2,
        //     basicMat2,
        //     basicMat2,
        //     basicMat2
        // ]

        this.cube = new THREE.Mesh(this.gF, mats)
        this.cube.position.x = this.pW * 0.5;
        if (this.options.shadows) {

            this.cube.castShadow = true
            this.cube.receiveShadow = true
        }

        // this.castShadow = true
        // this.receiveShadow  = true


        // if(this.index ==  1) 
        // this.cube.castShadow = true
        // else
        // this.cube.receiveShadow = true

        this.gF.faceVertexUvs[1] = this.gF.faceVertexUvs[0];

        this.showMat()


        this.cubeEmpty = new THREE.Mesh(
            new THREE.BoxGeometry(this.pW, this.pH, 0.01, 1, 1, 0), mats2
        )

        this.cubeEmpty.position.x = this.pW * 0.5;

        this.pageFlippedAngle = Math.PI * this.options.pageFlippedAngle / 180

        this.bendF = new MOD3.Bend(0, 0, 0);
        this.bendF.constraint = MOD3.ModConstant.LEFT;
        if (this.pH > this.pW)
            this.bendF.switchAxes = true;


        this.b2 = new MOD3.Bend(0, 0, 0);
        this.b2.constraint = MOD3.ModConstant.LEFT;
        if (this.pH > this.pW)
            this.b2.switchAxes = true;
        this.b2.offset = .98
        this.b2.setAngle(1)

        this.modF = new MOD3.ModifierStack(new MOD3.LibraryThree(), this.cube);
        this.modF.addModifier(this.bendF);

        if (i == 0 && this.options.cornerCurl) {
            this.modF.addModifier(this.b2);
        }

        // this.modF.addModifier(this.b2);

        this.modF.apply()

    };

    FLIPBOOK.PageWebGL.prototype = new THREE.Object3D();
    FLIPBOOK.PageWebGL.prototype.constructor = FLIPBOOK.PageWebGL;

    FLIPBOOK.PageWebGL.prototype.startCornerCurl = function() {

        this.cornerCurl = true

    }

    FLIPBOOK.PageWebGL.prototype.stopCornerCurl = function() {

        this.cornerCurl = false
        this.b2.force = 0
        this.modF.apply()

    }

    FLIPBOOK.PageWebGL.prototype.onPageCanvasLoaded = function(page, side, callback) {

        // console.log("loaded page ",page.pdfPageIndex," ",side)

        if (side == 'front' && this.sizeFront != page.size) {

            // console.log("onPageCanvasLoaded ", page, side)

            // this.loadedFront = true
            this.sizeFront = page.size
            var c = page.canvas
            var t1 = new THREE.CanvasTexture(c)

            // t1.anisotropy = this.book.renderer.capabilities.getMaxAnisotropy();

            t1.minFilter = THREE.LinearFilter
            //t1.generateMipmaps = false
            t1.needsUpdate = true
            t1.repeat.x = c.scaleX
            t1.repeat.y = c.scaleY
            t1.offset.y = 1 - c.scaleY
            //             if (c.double && c.pageIndex % 2 != 0) t1.offset.x = .5

            if (c.double) t1.offset.x = .5

            this.frontMaterial = this.createMaterial(t1, 'front')
            this.frontMaterial.needsUpdate = true
            this.setFrontMat(this.frontMaterial)

        } else if (side == 'back' && this.sizeBack != page.size) {

            // console.log("onPageCanvasLoaded ", page, side)

            // this.loadedBack = true
            this.sizeBack = page.size
            var c = page.canvas
            var t2 = new THREE.CanvasTexture(c)
            //t2.generateMipmaps = false

            // t2.anisotropy = this.book.renderer.capabilities.getMaxAnisotropy();
            t2.minFilter = THREE.LinearFilter
            t2.needsUpdate = true
            t2.repeat.x = c.scaleX
            t2.repeat.y = c.scaleY
            t2.offset.y = 1 - c.scaleY
            //             if (c.double && c.pageIndex % 2 != 0) t2.offset.x = .5

            this.backMaterial = this.createMaterial(t2, 'back')
            this.backMaterial.needsUpdate = true
            // FLIPBOOK.Buffer.addMaterial(self.backMaterial)
            this.setBackMat(this.backMaterial)


        }

        callback.call(this)

        //this.book.updateHtmlLayer()

    }

    FLIPBOOK.PageWebGL.prototype.load = function(side, callback) {

        // console.log("load page "+this.index,side,size)


        var model = this.book.model

        if(!model.wrapperH) return;
        if(!model.zoom) return;

        var pages = this.book.pages
        var texture, self = this;
        var options = this.book.options

        for (var i = 0; i < pages.length; i++) {
            var p = pages[i]
            if (p.flippingLeft || p.flippingRight)
                return
        }

        this.disposed = false

        var index = self.options.rightToLeft ? this.book.pages.length - this.index - 1 : this.index;
        var p1 = self.options.rightToLeft ? 2 * index + 1 : 2 * index
        var p2 = self.options.rightToLeft ? 2 * index : 2 * index + 1

        var o = options
        var pageSize = model.wrapperH * model.zoom
        var size = pageSize < o.pageTextureSizeTreshold ? o.pageTextureSizeSmall : o.pageTextureSize

        if (side == 'front') {

            if (this.sizeFront == size) {
                if (callback) callback.call(this)
            } else {

                // console.log("loading page "+this.index+" front")

                // this.sizeFront = size

                this.options.main.loadPage(p1, size, function(page) {

                    if (!page) {
                        if (callback) callback.call(self)
                        return
                    }

                    if (page.canvas) {

                        self.onPageCanvasLoaded(page, "front", callback)

                    } else if (page.image) {

                        if (self.loadedFront) {
                            callback.call(self)
                            return
                        }

                        self.loadedFront = true

                        var t1 = new THREE.Texture()
                        t1.image = page.image

                        t1.minFilter = THREE.LinearFilter

                        // if (textureNeedsPowerOfTwo(t1) && !isPowerOfTwo(t1.image))
                        //     t1.image = makePowerOfTwo(t1.image);

                        // // t1.generateMipmaps = false;
                        // t1.anisotropy = self.book.renderer.capabilities.getMaxAnisotropy();
                        t1.needsUpdate = true
                        
                        if (self.options.pages[2 * self.index].side == 'left') {
                            t1.repeat.x = .5
                        } else if (self.options.pages[2 * self.index].side == 'right') {
                            t1.repeat.x = .5
                            t1.offset.x = .5
                        }
                        //front loaded
                        self.frontMaterial = self.createMaterial(t1);

                        self.setFrontMat(self.frontMaterial)

                        callback.call(self)
                       
                    }

                })
            }
        } else if (side == "back") {

            if (this.sizeBack == size) {
                if (callback) callback.call(this)
            } else {

                // console.log("loading page "+this.index+" back")

                this.options.main.loadPage(p2, size, function(page) {

                    if (!page) {
                        if (callback) callback.call(self)
                        return
                    }


                    if (page.canvas) {

                        self.onPageCanvasLoaded(page, "back", callback)

                    } else if (page.image) {

                        if (self.loadedBack) {
                            callback.call(self)
                            return
                        }

                        self.loadedBack = true

                        var t2 = new THREE.Texture()
                        t2.image = page.image

                        t2.minFilter = THREE.LinearFilter

                        t2.needsUpdate = true
                        
                        if (self.options.pages[2 * self.index + 1].side == 'left') {
                            t2.repeat.x = .5
                        } else if (self.options.pages[2 * self.index + 1].side == 'right') {
                            t2.repeat.x = .5
                            t2.offset.x = .5
                        }
                        //back loaded
                        self.backMaterial = self.createMaterial(t2, 'back');
                        self.setBackMat(self.backMaterial)

                        callback.call(self)
                 
                    }

                })
            }
        }

    };

    FLIPBOOK.PageWebGL.prototype.unload = function(side) {

        if (side == 'front' && this.sizeFront) {

            var mat = this.cube.material[4]

            var t = mat.map

            mat.dispose()

            if (t) t.dispose()

            this.loadedFront = false
            this.sizeFront = 0

            this.setFrontMat(this.preloaderMatF)

        } else if (side == 'back' && this.sizeBack) {

            var mat = this.cube.material[5]

            var t = mat.map

            mat.dispose()

            if (t) t.dispose()

            this.loadedBack = false
            this.sizeBack = 0

            this.setBackMat(this.preloaderMatB)

        }

    }

    // FLIPBOOK.PageWebGL.prototype.reload = function() {

    //     if (this.loadedFront) {

    //         this.loadedFront = false
    //         this.load("front", this.options.pageTextureSize, function(){})

    //     } 

    // }

    FLIPBOOK.PageWebGL.prototype.disposeMat = function() {

        /*if(this.disposed) return;*/

        if (!this.loaded)
            return

        var matF = this.cube.material[4]
        var matB = this.cube.material[5]

        var tF = matF.map
        var tB = matB.map

        matF.dispose()
        matB.dispose()

        if (tF) tF.dispose()
        if (tB) tB.dispose()

        this.disposed = true

        this.loaded = false

    }

    FLIPBOOK.PageWebGL.prototype.createMaterial = function(map, side) {

        var mat
        if (this.options.lights) {

            var sTexture = side == 'back' ? this.book.specularB : this.book.specularF
            var o = this.options
            mat = new THREE.MeshStandardMaterial({
                map: map,
                roughness: o.pageRoughness,
                metalness: o.pageMetalness,
                emissive: 0x000000,
                color: 0xffffff,
                lightMap: sTexture
            });
            //  console.log("new THREE.MeshStandardMaterial")

        } else {

            mat = new THREE.MeshBasicMaterial({
                map: map
            });

        }
        //  console.log("new THREE.MeshBasicMaterial")
        return mat

    };


    FLIPBOOK.PageWebGL.prototype._setAngle = function(angle, direction) {
        //console.log(angle,this.index)
        // console.log(angle)
        if (angle <= 180 && angle >= -180) {

            angle = (angle / 180) * Math.PI
            if (this.singlePage) {
                if (angle >= 90)
                    angle = 90
                if (angle < 0 /*&& angle > -90*/ )
                    angle -= 90
                if (angle < -180)
                    angle = -180
                if (this.index == (this.book.pages.length - 1))
                    return;

            } else {

                // this._flipped(angle >= 90 || (angle < 0 && angle >= -90))

            }

            //console.log(angle,this.index)

            if (angle < 0 /*|| (angle == 0 && this.flippingRight)*/ ) {
                angle = angle + Math.PI
            }

            this.angle = angle

            this.positionZ(200)
            this.dragging = true


            //test
            /*if((angle+0.0000001) > Math.PI){
                console.log("*********************")
                this.visible = false
            }
            else 
                this.visible = true

            this.rotation.y = -angle/2*/
            //

            this.rotation.y = -angle


            //console.log(angle)

            // this.bend.force = Math.sin(-angle*2)/2
            if (this.isFlippedLeft)
                this.bendF.force = /*this.bendB.force =*/ 1.35 * Math.pow(-Math.abs(Math.cos(-angle / 2)), 1) / Math.pow(this.pageHardness, 1.5);
            else
                this.bendF.force = /*this.bendB.force =*/ 1.35 * Math.pow(Math.abs(Math.sin(-angle / 2)), 1) / Math.pow(this.pageHardness, 1.5);
            this.updateBend()

            if (this.book.htmlLayerVisible) {
                this.book.$pageL.hide()
                this.book.$pageR.hide()
                this.book.$pageC.hide()
                this.book.htmlLayerVisible = false
            }

            this.book.needsUpdate = true
        }
    }

    FLIPBOOK.PageWebGL.prototype.updateBend = function() {

        this.stopCornerCurl()

        // this.b2.force = this.rotation.y + Math.PI / 2
        // console.log(this.rotation.y)
        this.modF.apply();
        /*this.modB.apply();*/
        // this.gF.mergeVertices();
        this.gF.computeFaceNormals();
        this.gF.computeVertexNormals(true);

        this.book.needsUpdate = true
        // this.gB.mergeVertices();
        /* this.gB.computeFaceNormals();
        this.gB.computeVertexNormals(true);*/

    }

    FLIPBOOK.PageWebGL.prototype.flipLeft = function(onComplete) {

        this.onComplete = onComplete;
        this.dragging = false;
        if (!this.isFlippedLeft && !this.flippingLeft && !this.flippingRight && this.index == this.book.flippedleft) {

            if (this.duration > 0) {

                this.flippingLeft = true;
                this.flipping = true;

                this.force = 0;
                var newForce = (1 + Math.random() * .5) / this.pageHardness;
                var newOffset = .1 + Math.random() * .2;
                this.to = {
                    angle: this.rotation.y,
                    t: -1,
                    xx: 0,
                    thiss: this,
                    force: this.force,
                    offset: this.offset
                };
                // this.bendIn(this.pageFlippedAngle, newForce, newOffset);
                this.bendIn(-Math.PI, newForce, newOffset);

            } else {

                // this.rotation.y = this.pageFlippedAngle;
                this.rotation.y = -Math.PI;
                this.flippingLeft = false;
                this.isFlippedLeft = true;
                this.flippingRight = false;
                this.isFlippedRight = false;

            }

            this.correctZOrder();

        }
    };

    FLIPBOOK.PageWebGL.prototype.correctZOrder = function() {

        var th = 4,
            i;

        // th = 50
        //correct z order
        this.position.z = th / 2 + 1;
        //console.log(this.position.z)
        /*this.showMat()*/
        //left side
        for (i = this.index - 1; i >= 0; i--) {

            this.book.pages[i].position.z = this.book.pages[i + 1].position.z - th / 2 - th / 2 - 1;
            //console.log(this.book.pages[i].position.z)

        }
        //right side
        for (i = this.index + 1; i < this.book.pages.length; i++) {

            this.book.pages[i].position.z = this.book.pages[i - 1].position.z - th / 2 - th / 2 - 1;
            //console.log(this.book.pages[i].position.z)

        }
    }

    FLIPBOOK.PageWebGL.prototype.flipLeftInstant = function(onComplete) {

        this.onComplete = onComplete;
        this.dragging = false;

        if (!this.isFlippedLeft && !this.flippingLeft && !this.flippingRight && this.index == this.book.flippedleft) {

            this.thiss = this;
            this.xx = 0;
            this.angle = -Math.PI;
            this.flippingLeft = true;
            this.isFlippedLeft = false;
            this.renderFlip();
            this.flippingLeft = false;
            this.isFlippedLeft = true;
            this.flippingRight = false;
            this.isFlippedRight = false;

            var th = 4
            //correct z order
            this.position.z = th / 2 + 1;


            //right side
            for (var i = this.index + 1; i < this.book.pages.length; i++) {

                this.book.pages[i].position.z = this.book.pages[i - 1].position.z - th / 2 - th / 2 - 1;

            }

            //left side
            if (this.index < this.book.pages.length - 1) {

                this.position.z = this.book.pages[this.index + 1].position.z;
                for (var i = this.index - 1; i >= 0; i--) {

                    this.book.pages[i].position.z = this.book.pages[i + 1].position.z - th / 2 - th / 2 - 1;

                }

            } else {

                if (this.index > 0) this.book.pages[this.index].position.z = this.book.pages[this.index - 1].position.z + th / 2 + th / 2 - 1;
            }

            this.flipFinished()
        }
    };

    FLIPBOOK.PageWebGL.prototype.hideMat = function() {

        if (this.showing) {

            this.remove(this.cube)
            this.add(this.cubeEmpty)
            this.showing = false
            //console.log('hiding ' + this.index)

        }

    }

    FLIPBOOK.PageWebGL.prototype.showMat = function() {

        if (!this.showing) {

            this.add(this.cube)
            this.remove(this.cubeEmpty)
            this.showing = true
            this.book.needsUpdate = true
            //console.log('---showing ' + this.index)

        }

    }

    FLIPBOOK.PageWebGL.prototype.setFrontMat = function(m) {

        if (this.cube.material[4] === m)
            return
        this.cube.material[4] = m;
        this.book.needsUpdate = true
        //this.frontMaterial = m

    }

    FLIPBOOK.PageWebGL.prototype.setBackMat = function(m) {

        if (this.cube.material[5] === m)
            return
        this.cube.material[5] = m;
        this.book.needsUpdate = true
        //this.backMaterial = m

    }

    FLIPBOOK.PageWebGL.prototype.flipRightInstant = function(onComplete) {

        this.onComplete = onComplete;
        this.dragging = false;
        if (!this.isFlippedRight && !this.flippingRight && !this.flippingLeft && this.index == this.book.getNumPages() - this.book.flippedright - 1) {

            this.thiss = this;
            this.xx = 0;
            this.angle = 0;
            this.flippingRight = true;
            this.isFlippedRight = false;
            this.renderFlip();
            this.flippingLeft = false;
            this.isFlippedLeft = false;
            this.flippingRight = false;
            this.isFlippedRight = true;

            var th = 4
            //correct z order
            this.position.z = th / 2 + 1;

            //left side
            for (var i = this.index - 1; i >= 0; i--) {
                this.book.pages[i].position.z = this.book.pages[i + 1].position.z - th / 2 - th / 2 - 1;
            }

            //right side
            if (this.index > 0) {

                this.position.z = this.book.pages[this.index - 1].position.z;
                for (var i = this.index + 1; i < this.book.pages.length; i++) {

                    this.book.pages[i].position.z = this.book.pages[i - 1].position.z - th / 2 - th / 2 - 1;

                }

            } else {

                if (this.book.pages.length > 1)
                    this.position.z = this.book.pages[this.index + 1].position.z + th / 2 + th / 2 - 1;
            }

            this.flipFinished()
        }

    };

    FLIPBOOK.PageWebGL.prototype.flipRight = function(onComplete) {

        this.onComplete = onComplete;
        this.dragging = false;
        if (!this.isFlippedRight && !this.flippingRight && !this.flippingLeft && this.index == this.book.getNumPages() - this.book.flippedright - 1) {

            if (this.duration > 0) {

                this.flippingRight = true;
                this.flipping = true;

                this.force = 0;
                this.to = {
                    angle: this.rotation.y,
                    t: -1,
                    xx: 0,
                    thiss: this,
                    force: this.force,
                    offset: this.offset
                };
                var newForce = (-1 - Math.random() * .5) / this.pageHardness;
                var newOffset = .1 + Math.random() * .2;
                this.bendIn(0, newForce, newOffset);

            } else {

                this.rotation.y = 0;
                this.flippingLeft = false;
                this.isFlippedLeft = false;
                this.flippingRight = false;
                this.isFlippedRight = true;

            }

            this.correctZOrder()

        }

    };

    FLIPBOOK.PageWebGL.prototype.bendIn = function(angle, newForce, newOffset) {

        // var rand = Math.random() * (Math.PI / 24) - (Math.PI / 48)
        // this.bendF.setAngle(rand);
        // this.bendB.setAngle(rand);
        this.bendF.force = 0.0;
        this.bendF.offset = 0.0;

        this.updateBend()

        var time1 = 2 * this.duration * 240 * Math.pow((Math.abs(this.rotation.y - angle) / Math.PI), .5) * Math.pow(this.pageHardness, .25);
        //tween page rotation Y
        new FLIPBOOK.TWEEN.Tween(this.to).to({

                angle: angle,
                xx: 1,
                t: 1

            }, time1)
            .easing(FLIPBOOK.TWEEN.Easing.Sinusoidal.In)
            .onUpdate(this.renderFlip)
            .onComplete(this.bendOut)
            .start();

        // jQuery(this.book).trigger('playFlipSound')
        this.options.main.playFlipSound()

    };

    FLIPBOOK.PageWebGL.prototype.bendOut = function() {

        //tween bend.force to 0
        var self = this.thiss;
        var time = self.duration * Math.pow(Math.abs(self.bendF.force), .5) * 1000;
        new FLIPBOOK.TWEEN.Tween(self.bendF).to({
                force: 0,
                offset: 1
            }, time)
            .easing(FLIPBOOK.TWEEN.Easing.Sinusoidal.Out)
            .onUpdate(function() {
                self.updateBend()
            })
            .onComplete(function() {
                self.flipFinished(self)
            })
            .start();

        var th = 4
        if (self.flippingLeft) {


            if (self.index < self.book.pages.length - 1) {

                self.position.z = self.book.pages[self.index + 1].position.z;
                for (var i = self.index - 1; i >= 0; i--) {

                    self.book.pages[i].position.z = self.book.pages[i + 1].position.z - th / 2 - th / 2 - 1;

                }

            } else {

                if (self.book.pages.length > 1)
                    self.book.pages[self.index].position.z = self.book.pages[self.index - 1].position.z + th / 2 + th / 2 - 1;

            }

        }
        if (self.flippingRight) {

            if (self.index > 0) {

                self.position.z = self.book.pages[self.index - 1].position.z;
                for (var i = self.index + 1; i < self.book.pages.length; i++) {

                    self.book.pages[i].position.z = self.book.pages[i - 1].position.z - th / 2 - th / 2 - 1;
                }

            } else {

                if (self.book.pages.length > 1)
                    self.position.z = self.book.pages[self.index + 1].position.z + th / 2 + th / 2 - 1;

            }

        }

    };
    FLIPBOOK.PageWebGL.prototype.modApply = function() {
        this.thiss.bendF.force = this.thiss.bendB.force = this.force;
        this.thiss.bendF.offset = this.thiss.bendB.offset = this.offset;
        this.thiss.updateBend()
    };
    FLIPBOOK.PageWebGL.prototype.renderFlip = function() {
        this.thiss._setAngle(-this.angle * 180 / Math.PI)
    };
    FLIPBOOK.PageWebGL.prototype.flipFinished = function() {
        var self = this;

        if (self.flippingLeft) {

            self.flippingLeft = false;
            self.isFlippedLeft = true;
            self.flippingRight = false;
            self.isFlippedRight = false;

        } else if (self.flippingRight) {

            self.flippingLeft = false;
            self.isFlippedRight = true;
            self.flippingRight = false;
            self.isFlippedLeft = false;

        }

        self.bendF.force = 0.0;
        self.bendF.offset = 0.0;
        self.updateBend()
        self.flipping = false;
        self.dragging = false;
        if (typeof(self.onComplete) != 'undefined') self.onComplete(self);
        self.book.flipFinnished();

        //self.book.options.main.turnPageComplete()
    };
    FLIPBOOK.PageWebGL.prototype.isFlippedLeft = function() {

        return this.thiss.isFlippedLeft;

    };
    FLIPBOOK.PageWebGL.prototype.isFlippedRight = function() {

        return this.thiss.isFlippedRight;

    };

    FLIPBOOK.PageWebGL.prototype.positionZ = function() {

    }
}

{ /* FLIPBOOK.BookWebGL */
    FLIPBOOK.BookWebGL = function(el, model, options) {

        this.wrapper = el
        this.options = options;
        this.model = model;

        this.options.cameraDistance = 2800

        this.pageW = options.pageWidth;
        this.pageH = options.pageHeight;

        this.pageW = 1000 * options.pageWidth / options.pageHeight;
        this.pageH = 1000;

        options.pageWidth = this.pageW
        options.pageHeight = this.pageH

        this.scroll = options.scroll;
        this.pagesArr = options.pages;
        this.pages = [];
        this.animating = false;

        this.sc = 1;

        var s = this.wrapper.style;
        s.width = '100%';
        s.height = '100%';
        s.position = 'absolute';
        s.overflow = 'hidden';

        this.options.cameraDistance = this.options.cameraDistance / 1.5
        //this.goToPage(options.startPage, true)
        // this.stats = new Stats();
        // this.stats.domElement.style.position = 'absolute';
        // this.stats.domElement.style.top = '0px';
        // this.wrapper.appendChild( this.stats.domElement );

        /*window.rendererStats   = new THREEx.RendererStats()
        window.rendererStats.domElement.style.position = 'absolute';
        window.rendererStats.domElement.style.top = '0px';
        this.wrapper.appendChild( window.rendererStats.domElement );*/

    };

    FLIPBOOK.BookWebGL.prototype = Object.create(FLIPBOOK.Book.prototype)

    FLIPBOOK.BookWebGL.prototype.constructor = FLIPBOOK.BookWebGL


    FLIPBOOK.BookWebGL.prototype.init3d = function() {
        // WebGL starts here
        var self = this,
            VIEW_ANGLE = 30,
            w = jQuery(self.wrapper).width(),
            h = jQuery(self.wrapper).height(),
            ASPECT = w / h,
            NEAR = 1,
            FAR = 10000,
            o = this.options;

        //scene
        this.Scene = new THREE.Scene();
        this.centerContainer = new THREE.Object3D();
        this.Scene.add(this.centerContainer);

        this.Camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        //this.Camera.position.set(0,0,500)
        this.Scene.add(this.Camera);
        this.zoom = o.zoom;
        this.pan = o.pan;
        this.tilt = o.tilt;

        this.updateCameraPosition();

        var container = this.wrapper
        var c = document.createElement('canvas')
        var ctx = c.getContext('webgl')

        var renderer = new THREE.WebGLRenderer({
            antialias: this.options.antialias,
            alpha: true
        });

        window.renderer = renderer

        renderer.gammaInput = true;
        renderer.gammaOutput = true;

        if (this.options.shadows) {
            renderer.shadowMap.enabled = true;
            // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.shadowMap.type = THREE.PCFShadowMap;
            // renderer.shadowMap.type = THREE.BasicShadowMap;
        }


        window.webglrenderer = this.renderer = renderer
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        var pr = window.devicePixelRatio < o.minPixelRatio ? o.minPixelRatio : window.devicePixelRatio
        // pr = 1
        this.renderer.setPixelRatio(pr)
        container.appendChild(this.renderer.domElement);

        var htmlLayer = false
        var pages = this.options.pages
        for (var i = 0; i < pages.length; i++) {
            if (pages[i].htmlContent) htmlLayer = true
        };

        this.options.hasHtmlContent = htmlLayer || o.pdfMode
        if (this.options.hasHtmlContent)
            this.initHtmlContent()

        this.canvas = this.renderer.domElement

        this._bind('mousedown', this.canvas.parentNode.parentNode);
        this._bind('mousemove', this.canvas.parentNode.parentNode);
        this._bind('mouseout', this.canvas.parentNode.parentNode);
        this._bind('mouseup', this.canvas.parentNode.parentNode);

        this._bind('touchstart', this.canvas.parentNode.parentNode);
        this._bind('touchmove', this.canvas.parentNode.parentNode);
        this._bind('touchend', this.canvas.parentNode.parentNode);
        this._bind('touchcancel', this.canvas.parentNode.parentNode);


        if (this.options.lights) {

            var sCol = o.lightColor
            var sIntensity = 1
            //sIntensity = 1
            var sl = new THREE.SpotLight(sCol);
            sl.intensity = o.lightIntensity;
            sl.position.set(o.lightPositionX, o.lightPositionY, o.lightPositionZ);
            // sl.position.set(0, 400, 2500);
            sl.distance = 4000
            // sl.penumbra = .1;
            // sl.decay = 0;


            if (this.options.shadows) {

                sl.castShadow = true
                sl.shadow.bias = -0.0000015
                // sl.shadow.camera.far = 4000;


                // this.Scene.add( new THREE.CameraHelper( sl.shadow.camera ) );
                // sl.shadow.camera.fov = 90;

                sl.shadow.mapSize.x = this.options.shadowMapSize
                sl.shadow.mapSize.y = this.options.shadowMapSize

                var mat = new THREE.ShadowMaterial()
                mat.opacity = this.options.shadowOpacity

                var bg = new THREE.Mesh(new THREE.BoxGeometry(10000, 10000, 1, 1, 1, 1),
                    mat)



                /*new THREE.MeshBasicMaterial({
                        color: 0xcccccc,
                        roughness: 1,
                        metalness: 0,
                        emissive: 0x222222
                    }))*/
                bg.position.set(0, 0, -o.shadowDistance)
                this.Scene.add(bg)
                bg.receiveShadow = true

            }



            // sl.position.z = 2 * o.pageWidth > o.pageHeight ? 1.2 * 2 * o.pageWidth : 1.2 * o.pageHeight



            this.Scene.add(sl);

            /*var lh = new THREE.SpotLightHelper( sl );
            this.Scene.add(lh)
            this.lh = lh
            



            var sCol = o.spotlightColor || 0xFFFFFF
            sCol = 0x555555
            var sIntensity = o.spotlightIntensity || .14
            sIntensity = 1
            var dl = new THREE.DirectionalLight(sCol);
            dl.intensity = sIntensity;
            dl.position.set(1000, 0, 2000);
            //dl.position.z = 2 * o.pageWidth > o.pageHeight ? 1.2 * 2 * o.pageWidth : 1.2 * o.pageHeight
            
            //this.Scene.add(dl);

            dl.castShadow = true;
            var d = 1000;

            //dl.shadow = new THREE.SpotLightShadow( new THREE.PerspectiveCamera(30,1,1,1000))
            
            dl.shadow.camera.left = -d;
            dl.shadow.camera.right = d;
            dl.shadow.camera.top = d;
            dl.shadow.camera.bottom = -d;

            dl.shadow.camera.near = 1;
            dl.shadow.camera.far = 5000;

            dl.shadow.mapSize.width = 1024;
            dl.shadow.mapSize.height = 1024;
            dl.shadow.bias = -0.001




            var spotLight = new THREE.SpotLight( 0xffffff );
            spotLight.name = 'Spot Light';
            spotLight.angle = 1;
            //spotLight.penumbra = 0.3;
            spotLight.position.set( 0, 0, 2000 );
            //spotLight.castShadow = true;
            //spotLight.shadow.camera.near = 1;
            //spotLight.shadow.camera.far = 3000;
            //spotLight.shadow.camera.fov = 30;

            //spotLight.shadow.mapSize.width = 1024;
            //spotLight.shadow.mapSize.height = 1024;

            spotLight.distance = 10000
            spotLight.penumbra = .1;
            spotLight.decay = 0;

            //this.Scene.add( spotLight );
            //this.Scene.add( new THREE.CameraHelper( spotLight.shadow.camera ) );


            //var lightHelper1 = new THREE.SpotLightHelper( spotLight );
            //this.Scene.add(lightHelper1)
            //this.lightHelper1 = lightHelper1

            //sl.shadowBias = -0.001;
*/

            var ambCol = o.ambientLightColor || 0x333333
            var al = new THREE.AmbientLight(ambCol)
            // this.Scene.add(al);

        }


        this.centerContainer.position.set(0, 0, 0);

        this.onResize()

        // align flipBook center container
        this.centerContainer.position.x = -this.pageW * .5 * this.centerContainer.scale.x;

        this.updateHtmlLayerPosition()

        this.flippedleft = 0;
        this.flippedright = 0;

        this.cameraZMin = 300;
        this.cameraZMax = 5000;


        //         var stats = new Stats();
        // stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        // document.body.appendChild( stats.dom );



        (function a() {
            if (self.rendering) {

                if (!self.enabled) {
                    return;
                }

                FLIPBOOK.TWEEN.update();

                if(self.needsUpdate){
                // if(1){
                    // self.frame = self.frame || 1
                    // self.frame++
                    // console.log("render frame ",self.frame)
                    //self.renderer.clear()
                    self.renderer.render(self.Scene, self.Camera);
                    self.needsUpdate = false
                
                
                //self.lh.update()
                if (self.htmlLayer)
                    self.cssRenderer.render(self.Scene, self.Camera);

            }

                // stats.update()

                //console.log(self.renderer.info.memory)

                // if(self.stats)
                // self.stats.update();
                // console.log("rendering..."+self.elementId)

                // if(window.rendererStats) window.rendererStats.update(renderer)



            }

            requestAnimationFrame(a);

        })()



        //this.initialized = true;
    };

    FLIPBOOK.BookWebGL.prototype.onPageLoaded = function(index, size) {

        var side
        var sheetIndex = Math.floor(index / 2)
        if (this.options.rightToLeft) {
            sheetIndex = this.pages.length - sheetIndex - 1
            side = index % 2 == 0 ? 'back' : 'front'
        } else {
            side = index % 2 == 0 ? 'front' : 'back'
        }

        // console.log('onPageLoaded ', index, ' ', size)

        //  this.pages[sheetIndex].onPageLoaded(index, side, size)

    }

    FLIPBOOK.BookWebGL.prototype.onPageUnloaded = function(index, size) {

        //console.log('onPageUnloaded ', index, ' ', size)

        var side
        var sheetIndex = Math.floor(index / 2)
        if (this.options.rightToLeft) {
            sheetIndex = this.pages.length - sheetIndex - 1
            side = index % 2 == 0 ? 'back' : 'front'
        } else {
            side = index % 2 == 0 ? 'front' : 'back'
        }

        this.pages[sheetIndex].unload(side)

    }

    FLIPBOOK.BookWebGL.prototype.initHtmlContent = function() {

        

        var htmlLayer = document.createElement('div')
        htmlLayer.className = "htmlLayer " + Math.random() 
        var $htmlLayer = jQuery(htmlLayer)
        this.$htmlLayer = $htmlLayer
        //jQuery(number).append(jQuery('<img src="images/book1/page1.jpg">'))


        this.$pageR = jQuery(document.createElement('div'))
            .addClass('R')
            .css({
                'width': 1000 * this.options.pageWidth / this.options.pageHeight + 'px',
                'height': '1000px',
                'position': 'absolute',
                'top': '-500px',
                'pointer-events': 'none'
            })
            .appendTo($htmlLayer)

        this.$pageRInner = jQuery('<div>')
            .css('pointer-events', 'all')
            .appendTo(this.$pageR)

        this.$pageL = jQuery(document.createElement('div'))
            .addClass('L')
            .css({
                'width': 1000 * this.options.pageWidth / this.options.pageHeight + 'px',
                'height': '1000px',
                'position': 'absolute',
                'top': '-500px',
                'left': -1000 * this.options.pageWidth / this.options.pageHeight + 'px',
                'pointer-events': 'none'
            })
            .appendTo($htmlLayer)

        this.$pageLInner = jQuery(document.createElement('div'))
            .css('pointer-events', 'all')
            .appendTo(this.$pageL)

        this.$pageC = jQuery(document.createElement('div'))
            .addClass('C')
            .css({
                'width': 2 * 1000 * this.options.pageWidth / this.options.pageHeight + 'px',
                'height': '1000px',
                'position': 'absolute',
                'top': '-500px',
                'left': -1000 * this.options.pageWidth / this.options.pageHeight + 'px',
                'pointer-events': 'none'
            })
            .appendTo($htmlLayer)

        this.$pageCInner = jQuery(document.createElement('div'))
            .css('pointer-events', 'all')
            .appendTo(this.$pageC)


        this.htmlLayer = new FLIPBOOK.CSS3DObject(htmlLayer);
        //htmlObj.rotation.y = Math.PI/3

        this.Scene.add(this.htmlLayer);

        this.cssRenderer = new FLIPBOOK.CSS3DRenderer();
        var container = this.wrapper
        // this.cssRenderer.setSize(container.clientWidth, container.clientHeight);

        this.wrapper.appendChild(this.cssRenderer.domElement);


        this.cssRenderer.domElement.style.position = 'absolute'
        this.cssRenderer.domElement.style.top = '0'
        this.cssRenderer.domElement.style.left = '0'
        this.cssRenderer.domElement.style.pointerEvents = 'none'
        this.cssRenderer.domElement.className = "cssRenderer " + Math.random()

        var self = this

        this.model.on("toolSelect",function(){
            self.updateTool()
        })
        this.model.on("toolMove",function(){
            self.updateTool()
        })

    }

    FLIPBOOK.BookWebGL.prototype.enablePrev = function(val) {
        this.prevEnabled = val
    }

    FLIPBOOK.BookWebGL.prototype.enableNext = function(val) {
        this.nextEnabled = val
    }

    FLIPBOOK.BookWebGL.prototype.isZoomed = function() {
        return this.options.zoom > this.options.zoomMin && this.options.zoom > 1
    }
    FLIPBOOK.BookWebGL.prototype.getRightPage = function() {
        return this.pages[this.flippedleft]
    }

    FLIPBOOK.BookWebGL.prototype.getNextPage = function() {
        return this.pages[this.flippedleft + 1]
    }

    FLIPBOOK.BookWebGL.prototype.getLeftPage = function() {
        return this.pages[this.flippedleft - 1]
    }

    FLIPBOOK.BookWebGL.prototype.getPrevPage = function() {
        return this.pages[this.flippedleft - 2]
    }

    FLIPBOOK.BookWebGL.prototype.onSwipe = function(event, phase, direction, distance, duration, fingerCount, fingerData) {

        //Here we can check the:
        //phase : 'start', 'move', 'end', 'cancel'
        //direction : 'left', 'right', 'up', 'down'
        //distance : Distance finger is from initial touch point in px
        //duration : Length of swipe in MS 
        //fingerCount : the number of fingers used

        if (this.isZoomed())
            return;

        //console.log(phase)

        if (phase == 'start') {
            //this.updateVisiblePages()
        }

        // out - distance is already calculated
        //distance = fingerData[0].start.x - fingerData[0].end.x

        if (direction == "right")
            distance *= -1;


        var left = this.getLeftPage()
        var right = this.getRightPage()
        var next = this.getNextPage()
        var prev = this.getPrevPage()

        if (this.options.rotateCameraOnMouseDrag && (!right || !right.dragging) && (!left || !left.dragging) && (this.onMouseMove == 'rotate' || this.onMouseMove == 'scroll'))
            return

        if ((phase == 'cancel' || phase == 'end') && fingerCount <= 1) {

            if (this.view == 1 && this.draggingBook && direction == "left") {
                this.nextPage()
                this.draggingBook = false
                return
            }

            if (this.view == 1 && this.draggingBook && direction == "right") {
                this.prevPage()
                this.draggingBook = false
                return
            }


            if (distance < 0 && (!right || !right.dragging))
                this.prevPage()
            else if (distance > 0 && (!left || !left.dragging))
                this.nextPage()
            else if (distance == 0)
                this.clickedPage ? this.clickedPage.isFlippedLeft ? this.prevPage() : this.nextPage() : null

            if (right)
                right.dragging = false
            if (left)
                left.dragging = false

        }

        if (phase == 'move' && fingerCount <= 1) {

            if (this.draggingBook) {
                this.centerContainer.position.x = this.draggingBookStartX - distance
                this.updateHtmlLayerPosition()
                return
            }

            if (this.view == 1 && this.isFocusedLeft() && direction == "left") {
                this.draggingBookStartX = this.centerContainer.position.x
                this.draggingBook = true
                return
            }

            if (this.view == 1 && this.isFocusedRight() && direction == "right") {
                this.draggingBookStartX = this.centerContainer.position.x
                this.draggingBook = true
                return
            }


            // distance = 180 * (fingerData[0].start.x - fingerData[0].end.x) / jQuery(this.wrapper).width()

            // if(direction == "right")
            // distance *= -1;

            distance = 180 * distance / this.wrapperW


            if ((left && left.flipping) || (right && right.flipping))
                return

            //both down
            //console.log(left,right,distance)
            if ((!right || !right.dragging) && (!left || !left.dragging)) {
                if (distance != 0) {
                    if (direction == 'right' && left && (!right || !right.dragging) && this.prevEnabled) {
                        left._setAngle(distance, direction)
                        left.positionZ(200)
                        if (prev)
                            prev.showMat()
                    } else if (direction == 'left' && right && this.nextEnabled) {
                        right._setAngle(distance, direction)
                        right.positionZ(200)
                        if (next)
                            next.showMat()
                    }
                }
            }
            //one is dragging
            else {
                if (left && !right || left && !right.dragging) {
                    if (distance <= 0)
                        left._setAngle(distance, direction)
                } else if (right && !left || right && !left.dragging) {
                    if (distance >= 0) {
                        right._setAngle(distance, direction)
                    }
                }
            }
        }
    }
    FLIPBOOK.BookWebGL.prototype.onResize = function() {
        var m = this.model,
            w = m.wrapperW,
            h = m.wrapperH,
            o = this.options,
            pw = o.pageWidth,
            ph = o.pageHeight,
            r1 = w / h,
            r2 = pw / ph

        if(h < 1000 && window.devicePixelRatio == 1)
            this.renderer.setPixelRatio(2)
        else{
            var pr = window.devicePixelRatio < o.minPixelRatio ? o.minPixelRatio : window.devicePixelRatio
            this.renderer.setPixelRatio(pr)
        }

        var s = Math.min(this.zoom, 1)

        var zoomMin = Number(o.zoomMin)

        if (o.responsiveView && w <= o.responsiveViewTreshold && r1 < 2 * r2) {
            //switch to single page mode
            this.view = 1

            if (r2 > r1)
                this.sc = zoomMin * r1 / (r2 * s);
            else
                this.sc = 1;

            if (this.rightIndex == 0 || this.isFocusedRight()) this.focusRight();
            else this.focusLeft();
        } else {
            this.view = 2

            if (r1 < 2 * r2)
                this.sc = zoomMin * r1 / (2 * r2 * s);
            else
                this.sc = 1;

            if (this.flippedleft == 0)
                this.focusRight();
            else if (this.flippedright == 0)
                this.focusLeft()
            else
                this.focusBoth()
        }

        this.renderer.setSize(w, h);

        // console.log(w,h)

        // console.log(this.model.wrapperW)

        if (this.htmlLayer) {
            //this.cssRenderer.setSize(w*this.sc, h*this.sc);
            this.cssRenderer.setSize(w, h);
            this.htmlLayer.scale.set(this.sc, this.sc, this.sc)
        }

        // update the camera
        this.Camera.aspect = w / h;
        this.Camera.updateProjectionMatrix();
        this.updateCameraPosition();
        this.updateBookPosition();

        this.wrapperW = w
        this.wrapperH = h

    };

    FLIPBOOK.BookWebGL.prototype.updateCameraPosition = function() {
        //tilt
        var angle = Math.PI * this.tilt / 180;
        var cameraX = 0;
        var cameraY = this.options.cameraDistance * Math.sin(angle) / (this.zoom);
        var cameraZ = this.options.cameraDistance * Math.cos(angle) / (this.zoom);

        this.centerContainer.scale.set(this.sc, this.sc, this.sc);

        //pan
        angle = Math.PI * this.pan / 180;
        cameraX = Math.sin(angle) * cameraZ;
        cameraZ = Math.cos(angle) * cameraZ;
        this.cameraZ = cameraZ

        //this.Camera.fov = 20
        //this.Camera.updateProjectionMatrix();

        this.Camera.position.set(Math.round(cameraX), Math.round(cameraY), Math.round(cameraZ));

        this.Camera.lookAt(this.Scene.position);

        this.needsUpdate = true

    };
    FLIPBOOK.BookWebGL.prototype.createPages = function() {
        //create all pages
        var self = this;
        var texturefront, textureback, hardness, page, i;

        /*if(self.options.rightToLeft){
        for (i=self.pagesArr.length-1;i>=0;i--)
            p.push(self.pagesArr[i])
    }else{
        p = self.pagesArr

    }*/

        var options = self.options

        var marginW = options.pageMiddleShadowSize

        var c = document.createElement("canvas");
        c.width = 64
        c.height = 64
        var ctx = c.getContext("2d");
        var grd = ctx.createLinearGradient(64 - marginW, 0, 64, 0);
        grd.addColorStop(0, "#AAAAAA");
        grd.addColorStop(1, options.pageMiddleShadowColorL);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 64, 64);
        var t = new THREE.CanvasTexture(c)
        /*console.log("new THREE.Texture")*/
        t.needsUpdate = true;
        self.specularB = t

        var c2 = document.createElement("canvas");
        c2.width = 64
        c2.height = 64
        var ctx2 = c2.getContext("2d");
        var grd2 = ctx2.createLinearGradient(0, 0, marginW, 0);
        grd2.addColorStop(0, options.pageMiddleShadowColorR);
        grd2.addColorStop(1, "#AAAAAA");
        ctx2.fillStyle = grd2;
        ctx2.fillRect(0, 0, 64, 64);
        var t2 = new THREE.CanvasTexture(c2)
        /*console.log("new THREE.Texture")*/
        t2.needsUpdate = true;
        self.specularF = t2



        var preloaderMatF, preloaderMatB

        if (self.options.pagePreloader) {

            var tex = new THREE.TextureLoader().load(self.options.pagePreloader, function() {

            });



            if (self.options.lights) {
                preloaderMatF = new THREE.MeshStandardMaterial({
                    map: tex,
                    roughness: self.options.pageRoughness,
                    metalness: self.options.pageMetalness,
                    emissive: 0x000000,
                    color: 0xededed,
                    lightMap: self.specularF
                })
                preloaderMatB = new THREE.MeshStandardMaterial({
                    map: tex,
                    roughness: self.options.pageRoughness,
                    metalness: self.options.pageMetalness,
                    emissive: 0x000000,
                    color: 0xededed,
                    lightMap: self.specularB
                })
            } else {
                preloaderMatF = preloaderMatB = new THREE.MeshBasicMaterial({
                    map: tex,
                    color: 0xededed
                })
            }





        } else {


            if (self.options.lights) {
                preloaderMatF = new THREE.MeshStandardMaterial({
                    roughness: self.options.pageRoughness,
                    metalness: self.options.pageMetalness,
                    emissive: 0x000000,
                    color: 0xededed,
                    lightMap: self.specularF
                })
                preloaderMatB = new THREE.MeshStandardMaterial({
                    roughness: self.options.pageRoughness,
                    metalness: self.options.pageMetalness,
                    emissive: 0x000000,
                    color: 0xededed,
                    lightMap: self.specularB
                })
            } else {
                preloaderMatF = preloaderMatB = new THREE.MeshBasicMaterial({
                    color: 0xededed
                })
            }



        }




        var p = self.options.pages

        for (i = 0; i < p.length / 2; i++) {
            hardness = (i == 0 || i == (p.length / 2 - 1)) ? self.options.coverHardness : self.options.pageHardness;
            page = new FLIPBOOK.PageWebGL(self, i, hardness, self.options, preloaderMatF, preloaderMatB);
            self.pages.push(page);
            self.centerContainer.add(page);
            self.flippedright++;

            /*if (self.options.loadAllPages)
                 page.load()*/

            var th = 4
            if (i > 0) {
                page.position.z = self.pages[i - 1].position.z - th / 2 - th / 2 - 1;
                if (this.bg) this.bg.position.z = page.position.z - 5
            } else
                page.position.z = th / 2;
        }

        self.initialized = true;

        this.updateHtmlLayer()

        /*window._m = new THREE.MeshBasicMaterial({color:0xff0000})
       var t =  new THREE.Mesh(new THREE.BoxGeometry(100,100,100), _m)
       this.Scene.add(t)

       console.log( "before", renderer.info.programs.length );
                t.material.dispose()
                console.log( "after", renderer.info.programs.length );*/


        /*  setTimeout(function(){
              console.log(window._m)
              window._m.dispose()
              setTimeout(function(){
                  console.log(window._m)
              },2000)
          },2000)*/

    };

    FLIPBOOK.BookWebGL.prototype.getNumPages = function() {
        return (this.pages.length);
    };

    FLIPBOOK.BookWebGL.prototype.centerContainer = function() {
        return (this.centerContainer);
    };

    FLIPBOOK.BookWebGL.prototype.goToPage = function(index, instant) { //index in book.pages, not page number



        if (!this.initialized) {
            // console.log("initializing...")
            var self = this;
            setTimeout(function() {
                self.goToPage(index, instant)
            }, 100)
            return;
        }

        //if(index % 2 != 0) index++;
        if (index < 0) index = 0
        if (index > this.options.pages.length)
            index = this.options.pages.length
        if (index % 2 != 0)
            index--;
        if (index == this.rightIndex) {
            this.turnPageComplete()
            return;
        }

        this.goingToPage = index;

        var self = this;

        var delay = this.options.pageFlipDuration * 1000 / 6;

        if (typeof(instant) != 'undefined' && instant) {

            // delay = 0;
            // for(var i=0;i<self.pages.length;i++  ){
            // self.pages[i].duration = 0;
            // }
            if (index > self.rightIndex) {
                while (self.rightIndex < index)
                    this.nextPageInstant()
            } else {
                while (self.rightIndex > index)
                    this.prevPageInstant()

            }

            this.updateBookPosition()
            this.turnPageComplete()
            this.updateHtmlLayer()
            return;
        }

        if (this.rightIndex > index) {

            delay = 1 / (this.rightIndex - index) * this.options.pageFlipDuration * 1000 / 6;
            if (this.rightIndex - index > 10) delay = 0

            if (this.rightIndex - 2 > index) {
                this.prevPage(false);
                if (delay > 0)
                    setTimeout(function() {
                        self.goToPage(index, instant)
                    }, delay);
                else
                    self.goToPage(index, instant);
            } else {
                this.prevPage();
                setTimeout(function() {
                    if (typeof(instant) != 'undefined' && instant) {
                        for (var i = 0; i < self.pages.length; i++) {
                            self.pages[i].duration = self.options.pageFlipDuration;
                        }
                    }
                    self.turnPageComplete()
                }, delay);
            }
        } else if (this.rightIndex < index) {

            delay = -1 / (this.rightIndex - index) * this.options.pageFlipDuration * 1000 / 6;
            if (this.rightIndex - index < -10) delay = 0

            if ((this.rightIndex + 2) < index) {
                this.nextPage(false);
                if (delay > 0)
                    setTimeout(function() {
                        self.goToPage(index, instant)
                    }, delay);
                else
                    self.goToPage(index, instant);
            } else {
                this.nextPage();
                setTimeout(function() {
                    if (typeof(instant) != 'undefined' && instant) {
                        for (var i = 0; i < self.pages.length; i++) {
                            self.pages[i].duration = self.options.pageFlipDuration;
                        }
                    }
                    self.turnPageComplete()
                }, delay);
            }
        }
    };

    FLIPBOOK.BookWebGL.prototype.nextPageInstant = function(load) {
        if (this.flippedright == 0)
            return;
        // if(!this.nextEnabled) return
        //    if flipping in opposite direction already - return
        var i;
        for (i = 0; i < this.pages.length; i++) {
            if (this.pages[i].flippingRight)
                return;
        }


        if (this.view == 1) {
            if (this.isFocusedLeft()) {
                this.focusRight(0);
                return
            } else {
                this.focusLeft(0, 0)
            }
        } else {
            if (this.flippedright == 1)
                this.focusLeft(0)
            else
                this.focusBoth(0)

        }



        var page = this.pages[this.pages.length - this.flippedright];

        page.flipLeftInstant();
        this.flippedleft++;
        this.flippedright--;
        this.setRightIndex(this.rightIndex + 2)

        this.updateBookPosition()
    };

    FLIPBOOK.BookWebGL.prototype.setRightIndex = function(value) {

            this.rightIndex = value

        },


        FLIPBOOK.BookWebGL.prototype.prevPageInstant = function(load) {
            if (this.flippedleft == 0)
                return;
            // if(!this.prevEnabled) return

            var i;
            for (i = 0; i < this.pages.length; i++) {
                if (this.pages[i].flippingLeft)
                    return;
            }

            if (this.view == 1) {
                if (this.isFocusedRight()) {
                    this.focusLeft(0);
                    return
                } else {
                    this.focusRight(0, 0)
                }
            } else {
                if (this.flippedleft == 1)
                    this.focusRight(0)
                else
                    this.focusBoth(0)
            }

            var page = this.pages[this.flippedleft - 1];

            page.flipRightInstant();
            this.flippedleft--;
            this.flippedright++;

            this.setRightIndex(this.rightIndex - 2)
            this.updateBookPosition()
        };

    FLIPBOOK.BookWebGL.prototype.nextPage = function(load) {

        // this.nextPageInstant();return;

        if (this.flippedright == 0)
            return;

        this.clickedPage = null
        if (this.flippedright == 1 && this.pages.length * 2 > this.options.numPages && !this.options.rightToLeft)
            return;
        //    if flipping in opposite direction already - return
        var i;
        var flipping = 0
        for (i = 0; i < this.pages.length; i++) {
            if (this.pages[i].flippingRight)
                return;
            if (this.pages[i].flipping) flipping++;
        }

        var page = this.pages[this.pages.length - this.flippedright];



        var prevPage = this.pages[page.index - 2];
        var beforePrevPage = this.pages[page.index - 3];
        var nextPage = this.pages[page.index + 1];

        /* if(beforePrevPage)
             beforePrevPage.hideMat()
         if (nextPage)
             nextPage.showMat()*/

        if (nextPage && flipping < 5)
            nextPage.showMat()


        if (this.view == 1) {
            if (this.isFocusedLeft()) {
                this.focusRight(300);
                return
            } else {
                this.focusLeft(600, 200)
            }
        } else {
            if (this.flippedright == 1)
                this.focusLeft(500)
            else
                this.focusBoth(500)

        }

        if (!page.flipping) {
            var self = this,
                onComplete;
            if (typeof(load) == 'undefined' || load) {
                onComplete = function(page) {
                    self.turnPageComplete()
                }
            }

            page.flipLeft(onComplete);
        }
        this.flippedleft++;

        this.flippedright--;
        this.setRightIndex(this.rightIndex + 2)

    };
    FLIPBOOK.BookWebGL.prototype.updateBookPosition = function() {

        if (this.view == 1) {

            this.isFocusedLeft() && this.rightIndex > 0 ? this.focusLeft() : this.focusRight()

        } else {
            if (this.rightIndex == 0)
                this.focusRight()
            else if (this.rightIndex >= this.options.numPages)
                this.focusLeft()
            else
                this.focusBoth()

        }

        this.centerContainer.position.y = 0

        this.updateHtmlLayerPosition()

        this.needsUpdate = true

    };

    FLIPBOOK.BookWebGL.prototype.updateHtmlLayerPosition = function() {

        if (this.htmlLayer) {
            this.htmlLayer.position.x = this.centerContainer.position.x
            this.htmlLayer.position.y = this.centerContainer.position.y
        }

        this.needsUpdate = true

    }

    FLIPBOOK.BookWebGL.prototype.turnPageComplete = function() {

        var self = this

        var pages = this.pages
        var main = this.options.main
        for (var i = 0; i < pages.length; i++) {
            var p = pages[i]
            if (p.flippingLeft || p.flippingRight)
                return
        }

        

        if (this.options.cornerCurl) {
            if (this.flippedleft == 0)
                this.pages[0].startCornerCurl()
            else
                this.pages[0].stopCornerCurl()
        }

        var rightPage = this.pages[this.flippedleft];
        var leftPage = this.pages[this.flippedleft - 1];
        var prevPage = this.pages[this.flippedleft - 2];
        var nextPage = this.pages[this.flippedleft + 1];
        var beforePrevPage = this.pages[this.flippedleft - 3];
        var afterNextPage = this.pages[this.flippedleft + 2];
        var updateHtmlLayer = this.updateHtmlLayer
        var loadMorePages = this.loadMorePages


        for (var i = 0; i < pages.length; i++) {
            var p = pages[i]
            if (p === rightPage || p === leftPage)
                p.showMat()


            if (leftPage && p.index < (leftPage.index - 2)) {
                p.hideMat()
                if (!this.options.pdfMode) p.disposeMat()
            }

            if (rightPage && p.index > (rightPage.index + 2)) {
                p.hideMat()
                if (!this.options.pdfMode) p.disposeMat()
            }

        }

        this.loadVisiblePages()

        this.options.main.turnPageComplete()

    }

    FLIPBOOK.BookWebGL.prototype.loadVisiblePages = function(){

        var rightPage = this.pages[this.flippedleft];
        var leftPage = this.pages[this.flippedleft - 1];
        var prevPage = this.pages[this.flippedleft - 2];
        var nextPage = this.pages[this.flippedleft + 1];
        var beforePrevPage = this.pages[this.flippedleft - 3];
        var afterNextPage = this.pages[this.flippedleft + 2];
        var updateHtmlLayer = this.updateHtmlLayer
        var loadMorePages = this.loadMorePages
        var self = this
        var pages = this.pages
        var main = this.options.main

        main.setLoadingProgress(.1)

        if (leftPage) {
            leftPage.load("back", function(c) {

                if (rightPage)
                    rightPage.load("front", function(c) {

                        main.setLoadingProgress(1)
                        updateHtmlLayer.call(self)
                        loadMorePages.call(self)
                    });
                else {
                    main.setLoadingProgress(1)
                    updateHtmlLayer.call(self)
                    loadMorePages.call(self)

                }
            });
        } else {
            rightPage.load("front", function(c) {

                main.setLoadingProgress(1)
                updateHtmlLayer.call(self)
                loadMorePages.call(self)

            });
        }


    }

    FLIPBOOK.BookWebGL.prototype.focusLeft = function(time, delay) {

        // if (this.isFocusedLeft()) return;

        var newX = this.options.pageWidth * .5 * this.centerContainer.scale.x
        this.moveToPos(newX, time, delay)

    };

    FLIPBOOK.BookWebGL.prototype.focusRight = function(time, delay) {

        //if (this.isFocusedRight()) return;

        var newX = -this.options.pageWidth * .5 * this.centerContainer.scale.x
        this.moveToPos(newX, time, delay)

    };

    FLIPBOOK.BookWebGL.prototype.focusBoth = function(time, delay) {

        if (this.isFocusedLeft() || this.isFocusedRight())
            this.moveToPos(0, time, delay)

    };

    FLIPBOOK.BookWebGL.prototype.moveToPos = function(pos, time, delay) {

        if (time && this.movingTo != pos && this.centerContainer.position.x != pos) {

            // console.log("tween")
            var self = this
            this.movingTo = pos
            var tween = new FLIPBOOK.TWEEN.Tween(this.centerContainer.position).to({
                    x: pos
                }, time)
                .easing(FLIPBOOK.TWEEN.Easing.Sinusoidal.Out)
                .onUpdate(function() {
                    self.updateHtmlLayerPosition()
                })
                .onComplete(function() {
                    self.movingTo = null

                    self.updateHtmlLayerPosition()


                })
                .delay(delay || 0)
                .start();

        } else
            this.centerContainer.position.x = pos
    };

    FLIPBOOK.BookWebGL.prototype.isFocusedLeft = function() {

        return this.centerContainer.position.x > 0

    };

    FLIPBOOK.BookWebGL.prototype.isFocusedRight = function() {

        return this.centerContainer.position.x < 0

    };

    FLIPBOOK.BookWebGL.prototype.prevPage = function(load) {

        // this.prevPageInstant();return;
        if (this.flippedleft == 0)
            return;

        this.clickedPage = null

        if (this.flippedleft == 1 && this.pages.length * 2 == this.options.numPages && this.options.rightToLeft && this.options.oddPages)
            return;

        var i;
        var flipping = 0
        for (i = 0; i < this.pages.length; i++) {
            if (this.pages[i].flippingLeft)
                return;

            if (this.pages[i].flipping) flipping++;
        }

        var page = this.pages[this.flippedleft - 1];

        var prevPage = this.pages[page.index - 1];
        var nextPage = this.pages[page.index + 2];
        var afterNextPage = this.pages[page.index + 3];

        /*  if (prevPage)
              prevPage.showMat()
          if(afterNextPage)
              afterNextPage.hideMat()*/

        if (prevPage && flipping < 5)
            prevPage.showMat()



        if (this.view == 1) {
            if (this.isFocusedRight()) {
                this.focusLeft(300);
                return
            } else {
                this.focusRight(600, 200)
            }
        } else {
            if (this.flippedleft == 1)
                this.focusRight(500)
            else
                this.focusBoth(500)
        }

        if (!page.flipping) {
            var self = this,
                onComplete;
            if (typeof(load) == 'undefined' || load) {
                onComplete = function(page) {
                    self.turnPageComplete()
                }
            }
            page.flipRight(onComplete);
        }
        this.flippedleft--;
        this.flippedright++;

        this.setRightIndex(this.rightIndex - 2)

    };

    FLIPBOOK.BookWebGL.prototype.firstPage = function() {

    };

    FLIPBOOK.BookWebGL.prototype.flipFinnished = function() {

        // this.pages[this.flippedleft].load();
        // this.pages[this.flippedleft+1].load();
        // console.log("flip finnished");
        // this.pages[1].load();
        //console.log('flip finnished')
        this.updateHtmlLayer()
        this.needsUpdate = true

    };

    FLIPBOOK.BookWebGL.prototype.lastPage = function() {

    };

    FLIPBOOK.BookWebGL.prototype.updateVisiblePages = function() {

    };

    FLIPBOOK.BookWebGL.prototype.loadMorePages = function() {

        var spreadsToLoadF = this.options.loadPagesF
        var spreadsToLoadB = this.options.loadPagesB

        var rightPage = this.pages[this.flippedleft];
        var leftPage = this.pages[this.flippedleft - 1];

        for (var i = 0; i < spreadsToLoadF; i++) {

            leftPage = this.pages[this.flippedleft + i];
            if (leftPage) leftPage.load("back", function() {})

            rightPage = this.pages[this.flippedleft + 1 + i];
            if (rightPage) rightPage.load("front", function() {})


        }

        for (var i = 0; i < spreadsToLoadB; i++) {

            leftPage = this.pages[this.flippedleft - 2 + i];
            if (leftPage) leftPage.load("back", function() {})

            rightPage = this.pages[this.flippedleft - 1 + i];
            if (rightPage) rightPage.load("front", function() {})

        }

    }

    FLIPBOOK.BookWebGL.prototype.updateHtmlLayer = function() {

        if (!this.htmlLayer)
            return;

        for (var i = 0; i < this.pages.length; i++) {
            if (this.pages[i].flipping)
                return
        }
        //flip finnished
        //show left and right html content

        /* if(this.rightIndex == this.htmlContentRightIndex) return;*/

        this.htmlContentRightIndex = this.rightIndex;

        this.htmlLayerVisible = false

        var R = this.options.rightToLeft ? this.options.pages.length - this.rightIndex - 1 : this.rightIndex
        var L = this.options.rightToLeft ? R + 1 : R - 1

        if (this.options.doublePage) {

            //cover



            if (this.rightIndex == 0) {

                var html = this.options.pages[R].htmlContent

                this.$pageL.hide()
                this.$pageC.hide()
                if (html) {

                    this.$pageRInner.empty()
                    var content = jQuery(html).appendTo(this.$pageRInner)
                    this.$pageR.show()
                    this.htmlLayerVisible = true

                } else {

                    this.$pageR.hide()

                }

                //back cover

            } else if (this.rightIndex == this.pages.length * 2) {

                var html = this.options.pages[L].htmlContent

                this.$pageR.hide()
                this.$pageC.hide()
                if (html) {

                    this.$pageLInner.empty();
                    var content = jQuery(html).appendTo(this.$pageLInner);
                    this.$pageL.show();
                    this.htmlLayerVisible = true;

                } else {

                    this.$pageL.hide()

                }

                //spreads

            } else {

                this.$pageL.hide()
                this.$pageR.hide()

                var html = this.options.pages[L].htmlContent || this.options.pages[R].htmlContent

                if (html) {

                    this.$pageCInner.empty()
                    var content = jQuery(html).appendTo(this.$pageCInner)
                    this.$pageC.show()
                    this.htmlLayerVisible = true

                } else {

                    this.$pageC.hide()

                }

            }



        } else {

            this.$pageC.hide()



            if (this.rightIndex == 0) {

                this.$pageL.hide()

            } else {

                //console.log(this.rightIndex,R,L)

                if (this.options.pages[L].htmlContent) {

                    this.$pageLInner.empty();
                    var content = jQuery(this.options.pages[L].htmlContent).appendTo(this.$pageLInner);
                    this.$pageL.show();
                    this.htmlLayerVisible = true;

                } else {

                    this.$pageL.hide()

                }

            }

            if (this.rightIndex == this.pages.length * 2) {

                this.$pageR.hide()

            } else {

                //console.log(this.rightIndex,R,L)

                if (this.options.pages[R].htmlContent) {

                    this.$pageRInner.empty()
                    var content = jQuery(this.options.pages[R].htmlContent).appendTo(this.$pageRInner)
                    this.$pageR.show()
                    this.htmlLayerVisible = true

                } else {

                    this.$pageR.hide()

                }

            }

        }

        this.updateTool()

    };

    FLIPBOOK.BookWebGL.prototype.updateTool = function() {

        if(this.options.main.tool == "toolSelect"){
            jQuery(".flipbook-textLayer").css("pointer-events","auto").removeClass(".flipbook-noselect")
        }else{
            jQuery(".flipbook-textLayer").css("pointer-events","none").addClass(".flipbook-noselect")
        }
        
    }

    FLIPBOOK.BookWebGL.prototype.onZoom = function() {


        // var pageSize = this.zoom * this.model.wrapperH
        // this.options.pageTextureSize = pageSize
        
        return

        var self = this
        if (this.enabled)
            setTimeout(function() {
                /*for (var i = 0; i < self.pages.length; i++) {
                    self.pages[i].loaded = false
                }*/
                /*var rightPage = self.pages[self.flippedleft];
                var leftPage = self.pages[self.flippedleft - 1];
                if (rightPage)
                    rightPage.load('front',2048);
                if (leftPage)
                    leftPage.load('back',2048);*/

                /*console.log(leftPage, rightPage)*/
                self.turnPageComplete()

            }, 100)

    };

    FLIPBOOK.BookWebGL.prototype.render = function(rendering) {

        var self = this;
        self.rendering = rendering;

    };

    FLIPBOOK.BookWebGL.prototype.zoomTo = function(amount, time, x, y) {

        // console.log("zoom to ",amount)
        if (this.zooming)
            return;
        if (typeof(time) === 'undefined')
            time = 0;

        var newCenter = {x:0,y:0}

        if (typeof x != 'undefined' && typeof y != 'undefined') {

            var ph = this.zoom * this.wrapper.clientHeight
            var phNew = amount * this.wrapper.clientHeight
            var scaleFactor = ph / 1000
            var scaleFactorNew = phNew / 1000
            var zoomFactor = amount / this.zoom
            var center = this.centerContainer.position
            var focus = { x: (x - this.wrapper.clientWidth / 2) / scaleFactor - center.x, y: (-y + this.wrapper.clientHeight / 2) / scaleFactor - center.y }
            var focusNew = { x: (x - this.wrapper.clientWidth / 2) / scaleFactorNew - center.x, y: (-y + this.wrapper.clientHeight / 2) / scaleFactorNew - center.y }

            newCenter = center
            newCenter.x = center.x - (focus.x - focusNew.x)
            newCenter.y = center.y - (focus.y - focusNew.y)

            
        }

        var self = this;
        newZoom = amount > this.options.zoomMax ? this.options.zoomMax : amount;
        newZoom = amount < this.options.zoomMin ? this.options.zoomMin : amount;

        if (newZoom == this.options.zoom) {
            //reset book position
            var o = this.options;
            var focusedLeft = this.isFocusedLeft()
            
            if (this.view == 1) {
                focusedLeft ? this.focusLeft() : this.focusRight();
            } else {
                this.centerContainer.position.set(0, 0, 0);
            }

            this.updateBookPosition()
        }

        time = 0


        if (time > 0) {
            if (!this.zooming) {
                this.zooming = true;

                // console.log(self.centerContainer.position)

                new FLIPBOOK.TWEEN.Tween(this).to({
                        zoom: newZoom,
                    }, time)
                    .easing(FLIPBOOK.TWEEN.Easing.Sinusoidal.In)
                    .onUpdate(this.updateCameraPosition)
                    .onComplete(function() {
                        self.zooming = false
                        self.onZoom()

                    })
                    .start();

                 new FLIPBOOK.TWEEN.Tween(this.centerContainer.position).to({
                        x:newCenter.x,
                        y:newCenter.y
                    }, time)
                    .easing(FLIPBOOK.TWEEN.Easing.Sinusoidal.In)
                    .onUpdate(function(){
                        // console.log(self.centerContainer.position)
                    })
                    .onComplete(function() {
                        // console.log(self.centerContainer.position)

                    })
                    .start();

                if(this.htmlLayer)
                    new FLIPBOOK.TWEEN.Tween(this.htmlLayer.position).to({
                        x:newCenter.x,
                        y:newCenter.y
                    }, time)
                    .easing(FLIPBOOK.TWEEN.Easing.Sinusoidal.In)
                    .start();

            }
        } else {
            this.zoom = newZoom

            this.centerContainer.position.set(newCenter.x, newCenter.y, 0);

            self.updateHtmlLayerPosition()

            this.updateCameraPosition()


            //this.centerContainer.position.set(newCenter.x, newCenter.y, 0);
            this.zooming = false
            self.onZoom()
        }


        if (amount <= 1 && amount <= this.zoom)
            this.updateBookPosition()


        this.options.main.onZoom(newZoom)
        
        this.turnPageComplete()

    };

    FLIPBOOK.BookWebGL.prototype.tiltTo = function(amount) {

        //    if(this.tilting)
        //        return;
        var self = this,
            factor = .3;
        var newTilt = this.tilt + amount * factor;
        newTilt = newTilt > this.options.tiltMax ? this.options.tiltMax : newTilt;
        newTilt = newTilt < this.options.tiltMin ? this.options.tiltMin : newTilt;

        this.tilt = newTilt;
        this.updateCameraPosition();

        //    this.tilting = true;
        //    new TWEEN.Tween(this).to({tilt:newTilt}, 400)
        //        .easing( TWEEN.Easing.Sinusoidal.EaseInOut)
        //        .onUpdate(this.updateCameraPosition)
        //        .onComplete(function(){self.tilting = false})
        //        .start();
    };

    FLIPBOOK.BookWebGL.prototype.panTo = function(amount) {

        //    if(this.tilting)
        //        return;
        var self = this,
            factor = .2;
        var newPan = this.pan - amount * factor;
        newPan = newPan > this.options.panMax ? this.options.panMax : newPan;
        newPan = newPan < this.options.panMin ? this.options.panMin : newPan;

        this.pan = newPan;
        this.updateCameraPosition();

    };

    FLIPBOOK.BookWebGL.prototype._bind = function(type, el, bubble) {

        (el || this.wrapper).addEventListener(type, this, !!bubble);

    };

    FLIPBOOK.BookWebGL.prototype.handleEvent = function(e) {

        var self = this;
        // e.preventDefault()
        //console.log(e);
        switch (e.type) {
            case 'mousedown':
                self._start(e);
                break;
            case 'touchstart':
                self._touchstart(e);
                break;
            case 'touchmove':
                self._touchmove(e);
                break;
            case 'mousemove':
                self._move(e);
                break;
            case 'mouseout':
            case 'mouseup':
            case 'touchend':
                self._end(e);
                break;
        }

    };

    FLIPBOOK.BookWebGL.prototype.resetCameraPosition = function() {

        this.centerContainer.position.set(0, 0, 0);

    };

    FLIPBOOK.BookWebGL.prototype._start = function(e) {

        this.mouseDown = true;
        this.onMouseMove = ""
        this.pointX = e.pageX;
        this.pointY = e.pageY;
        this.startPoint = e;
        var vector = this._getVector(e);
        vector.unproject(this.Camera)
        var raycaster = new THREE.Raycaster(this.Camera.position, vector.sub(this.Camera.position).normalize());
        var intersects = raycaster.intersectObjects(this.pages, true);
        this.pageMouseDown = (intersects.length > 0);
        var canvasClicked = e.target.nodeName.toLowerCase() == "canvas"
        if (canvasClicked && !this.pageMouseDown && this.options.lightBox && this.options.lightboxCloseOnClick) {
            this.options.main.lightbox.closeLightbox()
        }

    };

    FLIPBOOK.BookWebGL.prototype._touchstart = function(e) {

        if (e.touches.length > 1) {

            this.touches = []

            this.touches[0] = {
                pageX: e.touches[0].pageX,
                pageY: e.touches[0].pageY
            }

            this.touches[1] = {
                pageX: e.touches[1].pageX,
                pageY: e.touches[1].pageY
            }

            var c1 = Math.abs(this.touches[0].pageX - this.touches[1].pageX);
            var c2 = Math.abs(this.touches[0].pageY - this.touches[1].pageY);
            this.touchesDistStart = Math.sqrt(c1 * c1 + c2 * c2);
            return;

        }

        e = e.touches[0]
        this._start(e)

    };

    FLIPBOOK.BookWebGL.prototype._getVector = function(e) {

        var w = jQuery(this.canvas).width(),
            h = jQuery(this.canvas).height(),
            // x = e.clientX - jQuery(this.canvas).offset().left,
            x = e.pageX - jQuery(this.canvas).offset().left,
            // y = e.clientY - jQuery(this.canvas).offset().top,
            y = e.pageY - jQuery(this.canvas).offset().top,
            cx = jQuery(this.canvas).offset().x,
            cy = jQuery(this.canvas).offset().y;
        return new THREE.Vector3((x / w) * 2 - 1, -(y / h) * 2 + 1, 0.5);

    };

    FLIPBOOK.BookWebGL.prototype._touchmove = function(e) {

        //e.preventDefault()

        var self = this;
        if (e.touches.length > 1) {
            return

            this.touches = []

            this.touches[0] = {
                pageX: e.touches[0].pageX,
                pageY: e.touches[0].pageY
            }

            this.touches[1] = {
                pageX: e.touches[1].pageX,
                pageY: e.touches[1].pageY
            }

            var c1 = Math.abs(this.touches[0].pageX - this.touches[1].pageX);
            var c2 = Math.abs(this.touches[0].pageY - this.touches[1].pageY);
            this.touchesDist = Math.sqrt(c1 * c1 + c2 * c2);
            var newZoom = this.zoom * Math.pow(this.touchesDist / this.touchesDistStart, .2)
            if (newZoom >= this.options.zoomMin && newZoom <= this.options.zoomMax)
                this.zoomTo(newZoom, 20, this.touches[0].pageX / 2 + this.touches[1].pageX / 2, this.touches[0].pageY / 2 + this.touches[1].pageY / 2)
            this.updateCameraPosition()
            return;
        }

        e = e.touches[0];
        this._move(e)

    };

    FLIPBOOK.BookWebGL.prototype._move = function(e) {

        // return

        var vector = this._getVector(e);
        vector.unproject(this.Camera)
        var raycaster = new THREE.Raycaster(this.Camera.position, vector.sub(this.Camera.position).normalize());
        var intersects = raycaster.intersectObjects(this.pages, true);

        /*if(intersects.length > 0){
        this.wrapper.style.cursor = 'pointer';
    }else{
        this.wrapper.style.cursor = 'auto';
    }*/

        var point = e,
            deltaX = (point.pageX - this.pointX) * .5,
            deltaY = (point.pageY - this.pointY) * .5;

        this.pointX = point.pageX;
        this.pointY = point.pageY;

        if (!this.mouseDown) {
            this.onMouseMove = "";

            if (this.options.rotateCameraOnMouseMove) {
                this.tilt = this.options.tiltMin2 + (this.options.tiltMax2 - this.options.tiltMin2) * (1 - this.pointY / jQuery(this.canvas).height());
                this.pan = this.options.panMin2 + (this.options.panMax2 - this.options.panMin2) * this.pointX / jQuery(this.canvas).width();
                this.updateCameraPosition();
            }


            return;
        }

        if (intersects.length > 0) {
            if (this.onMouseMove == "") {
                if (this.zoom > 1)
                    this.onMouseMove = "scroll";
            }
        } else {
            if (this.onMouseMove == "")
                this.onMouseMove = "rotate";
        }

        if (this.onMouseMove == "scroll") {
            if(this.options.main.tool == "toolSelect")
                return
            if (deltaX != 0 || deltaY != 0) {
                this.moved = true

                this.centerContainer.position.x += (10000 * deltaX / (this.cameraZ * this.zoom * this.zoom));
                this.centerContainer.position.y -= (10000 * deltaY / (this.cameraZ * this.zoom * this.zoom));

            }
            // this.centerContainer.position.x = 100           

            this.updateHtmlLayerPosition()

        } else if (this.onMouseMove == "rotate") {
            var right = this.getRightPage()
            var left = this.getLeftPage()
            if (!this.options.rotateCameraOnMouseMove && this.options.rotateCameraOnMouseDrag && (!left || !left.dragging) && (!right || !right.dragging)) {
                this.tiltTo(deltaY);
                //this.panTo(deltaX);
            }
        }
    };

    FLIPBOOK.BookWebGL.prototype._end = function(e) {

        this.mouseDown = false;
        if (typeof(e.changedTouches) != 'undefined')
            e = e.changedTouches[0]
        this.pointX = e.pageX;
        this.pointY = e.pageY;
        this.endPoint = e;
        var vector = this._getVector(this.endPoint);
        vector.unproject(this.Camera)
        var raycaster = new THREE.Raycaster(this.Camera.position, vector.sub(this.Camera.position).normalize());
        var intersects = raycaster.intersectObjects(this.pages, true);
        /*if(intersects.length > 0){
        if(this.pageMouseDown && !this.moved ){
            var intersect = intersects[0];
            var page = intersect.object;
            if(page.flipping || page.dragging)
                return;
            if(this.getLeftPage() && this.getLeftPage().dragging )
                return;
            if(this.getRightPage() && this.getRightPage().dragging )
                return;
            if(page.isFlippedLeft)
                this.prevPage();
            else
                this.nextPage();
        }
    }*/

        if (intersects.length > 0) {
            if (this.pageMouseDown && !this.moved) {
                var intersect = intersects[0];
                this.clickedPage = intersect.object.parent;
            }
        }
        this.pageMouseDown = false;
        this.moved = false

    };

    FLIPBOOK.BookWebGL.prototype.moveCamera = function(deltaX, deltaY) {

    };

    FLIPBOOK.BookWebGL.prototype.enable = function() {

        if (this.enabled) {
            this.onResize();
            return;
        }
        this.enabled = true;

        if (!this.initialized) {
            this.init3d();
            this.createPages();
            this.rendering = false;
            // this.disable();
            this.onResize();
        }

        this.render(true);
        this.onResize();

    };
    FLIPBOOK.BookWebGL.prototype.disable = function() {
        this.enabled = false;
        this.render(false);
    };
}

{ /* MOD3D */
    /**
     *
     * http://github.com/foo123/MOD3
     *
     * MOD3 3D Modifier Library (port of actionscript AS3Mod to javascript)
     * supports: THREE.js, J3D, Copperlicht, Pre3D
     *
     * @author Nikos M.
     * @url http://nikos-web-development.netai.net/
     *
     **/
    var MOD3 = MOD3 || {};
    (function(a) {
        a.Constants = {
            PI: Math.PI,
            invPI: 1 / Math.PI,
            halfPI: 0.5 * Math.PI,
            doublePI: 2 * Math.PI,
            toRad: 1 / 180 * Math.PI,
            toDeg: 1 / 180 * Math.PI
        };
        a.ModConstant = {
            LEFT: -1,
            RIGHT: 1,
            NONE: 0,
            X: 1,
            Y: 2,
            Z: 4
        }
    })(MOD3);
    (function(a) {
        var c = a.Constants;
        a.XMath = {};
        a.XMath.normalize = function(c, d, e) {
            return d - c == 0 ? 1 : a.XMath.trim(0, 1, (e - c) / d)
        };
        a.XMath.toRange = function(a, c, e) {
            return c - a == 0 ? 0 : a + (c - a) * e
        };
        a.XMath.inRange = function(a, c, e, f) {
            typeof f == "undefined" && (f = !1);
            return f ? e >= a && e <= c : e > a && e < c
        };
        a.XMath.sign = function(a, c) {
            typeof c == "undefined" && (c = 0);
            return 0 == a ? c : a > 0 ? 1 : -1
        };
        a.XMath.trim = function(a, c, e) {
            return Math.min(c, Math.max(a, e))
        };
        a.XMath.wrap = function(a, c, e) {
            return e < a ? e + (c - a) : e >= c ? e - (c - a) : e
        };
        a.XMath.degToRad = function(a) {
            return a *
                c.toRad
        };
        a.XMath.radToDeg = function(a) {
            return a * c.toDeg
        };
        a.XMath.presicion = function(a, c) {
            var e = Math.pow(10, c);
            return Math.round(a * e) / e
        };
        a.XMath.uceil = function(a) {
            return a < 0 ? Math.floor(a) : Math.ceil(a)
        }
    })(MOD3);
    (function(a) {
        a.Range = function(a, b) {
            this.start = 0;
            this.end = 1;
            if (typeof a != "undefined") this.start = a;
            if (typeof b != "undefined") this.end = b
        };
        a.Range.prototype.getSize = function() {
            return this.end - this.start
        };
        a.Range.prototype.move = function(a) {
            this.start += a;
            this.end += a
        };
        a.Range.prototype.isIn = function(a) {
            return a >= this.start && a <= this.end
        };
        a.Range.prototype.normalize = function(c) {
            return a.XMath.normalize(this.start, this.end, c)
        };
        a.Range.prototype.toRange = function(c) {
            return a.XMath.toRange(this.start, this.end,
                c)
        };
        a.Range.prototype.trim = function(c) {
            return a.XMath.trim(this.start, this.end, c)
        };
        a.Range.prototype.interpolate = function(a, b) {
            return this.toRange(b.normalize(a))
        };
        a.Range.prototype.toString = function() {
            return "[" + this.start + " - " + this.end + "]"
        }
    })(MOD3);
    (function(a) {
        a.Phase = function(a) {
            this.value = 0;
            if (typeof a != "undefined") this.value = a
        };
        a.Phase.prototype.getPhasedValue = function() {
            return Math.sin(this.value)
        };
        a.Phase.prototype.getAbsPhasedValue = function() {
            return Math.abs(this.getPhasedValue())
        };
        a.Phase.prototype.getNormValue = function() {
            return (this.getPhasedValue() + 1) * 0.5
        }
    })(MOD3);
    (function(a) {
        a.Point = function(a, b) {
            this.y = this.x = 0;
            if (typeof a != "undefined") this.x = a;
            if (typeof b != "undefined") this.y = b
        };
        a.Point.prototype.clone = function() {
            return new a.Point(this.x, this.y)
        }
    })(MOD3);
    (function(a) {
        a.Matrix = function(a, b, d, e) {
            this.m11 = 1;
            this.m21 = this.m12 = 0;
            this.m22 = 1;
            if (typeof a != "undefined") this.m11 = a;
            if (typeof b != "undefined") this.m12 = b;
            if (typeof d != "undefined") this.m21 = d;
            if (typeof e != "undefined") this.m22 = e
        };
        a.Matrix.prototype.rotate = function(a) {
            var b = Math.cos(a),
                a = Math.sin(a);
            this.m11 = b;
            this.m12 = -a;
            this.m21 = a;
            this.m22 = b;
            return this
        };
        a.Matrix.prototype.scale = function(a, b) {
            this.m21 = this.m12 = 0;
            if (typeof a != "undefined") this.m22 = this.m11 = a;
            if (typeof b != "undefined") this.m22 = b;
            return this
        };
        a.Matrix.prototype.multiply = function(a) {
            var b = this.m11,
                d = this.m12,
                e = this.m21,
                f = this.m22,
                g = a.m11,
                h = a.m12,
                i = a.m21,
                a = a.m22;
            this.m11 = b * g + d * i;
            this.m12 = b * h + d * a;
            this.m21 = e * g + f * i;
            this.m22 = e * h + f * a;
            return this
        };
        a.Matrix.prototype.transformPoint = function(c) {
            return new a.Point(this.m11 * c.x + this.m12 * c.y, this.m21 * c.x + this.m22 * c.y)
        }
    })(MOD3);
    (function(a) {
        a.Vector3 = function(a, b, d) {
            this.z = this.y = this.x = null;
            this.x = a;
            this.y = b;
            this.z = d
        };
        a.Vector3.ZERO = function() {
            return new a.Vector3(0, 0, 0)
        };
        a.Vector3.dot = function(a, b) {
            return a.x * b.x + a.y * b.y + a.z * b.z
        };
        a.Vector3.prototype.clone = function() {
            return new a.Vector3(this.x, this.y, this.z)
        };
        a.Vector3.prototype.equals = function(a) {
            return this.x == a.x && this.y == a.y && this.z == a.z
        };
        a.Vector3.prototype.zero = function() {
            this.x = this.y = this.z = 0
        };
        a.Vector3.prototype.negate = function() {
            return new a.Vector3(-this.x, -this.y, -this.z)
        };
        a.Vector3.prototype.add = function(c) {
            return new a.Vector3(this.x + c.x, this.y + c.y, this.z + c.z)
        };
        a.Vector3.prototype.subtract = function(c) {
            return new a.Vector3(this.x - c.x, this.y - c.y, this.z - c.z)
        };
        a.Vector3.prototype.multiplyScalar = function(c) {
            return new a.Vector3(this.x * c, this.y * c, this.z * c)
        };
        a.Vector3.prototype.multiply = function(c) {
            return new a.Vector3(this.x * c.x, this.y * c.y, this.z * c.z)
        };
        a.Vector3.prototype.divide = function(c) {
            c = 1 / c;
            return new a.Vector3(this.x * c, this.y * c, this.z * c)
        };
        a.Vector3.prototype.normalize =
            function() {
                var a = this.x,
                    b = this.y,
                    d = this.z,
                    a = a * a + b * b + d * d;
                a > 0 && (a = 1 / Math.sqrt(a), this.x *= a, this.y *= a, this.z *= a)
            };
        a.Vector3.prototype.getMagnitude = function() {
            var a = this.x,
                b = this.y,
                d = this.z;
            return Math.sqrt(a * a + b * b + d * d)
        };
        a.Vector3.prototype.setMagnitude = function(a) {
            this.normalize();
            this.x *= a;
            this.y *= a;
            this.z *= a
        };
        a.Vector3.prototype.toString = function() {
            return "[" + this.x + " , " + this.y + " , " + this.z + "]"
        };
        a.Vector3.prototype.sum = function(a, b) {
            return a.add(b)
        };
        a.Vector3.prototype.dot = function(a, b) {
            return a.x *
                b.x + a.y * b.y + a.z * b.z
        };
        a.Vector3.prototype.cross = function(c, b) {
            var d = c.x,
                e = c.y,
                f = c.z,
                g = b.x,
                h = b.y,
                i = b.z;
            return new a.Vector3(e * i - f * h, f * g - d * i, d * h - e * g)
        };
        a.Vector3.prototype.distance = function(a, b) {
            var d = a.x - b.x,
                e = a.y - b.y,
                f = a.z - b.z;
            return Math.sqrt(d * d + e * e + f * f)
        }
    })(MOD3);
    (function(a) {
        a.Matrix4 = function(a, b, d, e, f, g, h, i, n, m, o, k, p, l, j, q) {
            this.n11 = 1;
            this.n21 = this.n14 = this.n13 = this.n12 = 0;
            this.n22 = 1;
            this.n32 = this.n31 = this.n24 = this.n23 = 0;
            this.n33 = 1;
            this.n43 = this.n42 = this.n41 = this.n34 = 0;
            this.n44 = 1;
            if (typeof a != "undefined") this.n11 = a;
            if (typeof b != "undefined") this.n12 = b;
            if (typeof d != "undefined") this.n13 = d;
            if (typeof e != "undefined") this.n14 = e;
            if (typeof f != "undefined") this.n21 = f;
            if (typeof g != "undefined") this.n22 = g;
            if (typeof h != "undefined") this.n23 = h;
            if (typeof i != "undefined") this.n24 =
                i;
            if (typeof n != "undefined") this.n31 = n;
            if (typeof m != "undefined") this.n32 = m;
            if (typeof o != "undefined") this.n33 = o;
            if (typeof k != "undefined") this.n34 = k;
            if (typeof p != "undefined") this.n41 = p;
            if (typeof l != "undefined") this.n42 = l;
            if (typeof j != "undefined") this.n43 = j;
            if (typeof q != "undefined") this.n44 = q
        };
        a.Matrix4.prototype.translationMatrix = function(a, b, d) {
            this.n14 = a;
            this.n24 = b;
            this.n34 = d;
            return this
        };
        a.Matrix4.prototype.scaleMatrix = function(a, b, d) {
            this.n11 = a;
            this.n22 = b;
            this.n33 = d;
            return this
        };
        a.Matrix4.prototype.rotationMatrix =
            function(a, b, d, e) {
                var f = Math.cos(e),
                    g = Math.sin(e),
                    e = 1 - f,
                    h = a * b * e,
                    i = b * d * e,
                    n = a * d * e,
                    m = g * d,
                    o = g * b;
                g *= a;
                this.n11 = f + a * a * e;
                this.n12 = -m + h;
                this.n13 = o + n;
                this.n14 = 0;
                this.n21 = m + h;
                this.n22 = f + b * b * e;
                this.n23 = -g + i;
                this.n24 = 0;
                this.n31 = -o + n;
                this.n32 = g + i;
                this.n33 = f + d * d * e;
                this.n34 = 0;
                return this
            };
        a.Matrix4.prototype.calculateMultiply = function(a, b) {
            var d = a.n11,
                e = b.n11,
                f = a.n21,
                g = b.n21,
                h = a.n31,
                i = b.n31,
                n = a.n12,
                m = b.n12,
                o = a.n22,
                k = b.n22,
                p = a.n32,
                l = b.n32,
                j = a.n13,
                q = b.n13,
                r = a.n23,
                t = b.n23,
                s = a.n33,
                u = b.n33,
                v = a.n14,
                w = b.n14,
                z = a.n24,
                x =
                b.n24,
                A = a.n34,
                y = b.n34;
            this.n11 = d * e + n * g + j * i;
            this.n12 = d * m + n * k + j * l;
            this.n13 = d * q + n * t + j * u;
            this.n14 = d * w + n * x + j * y + v;
            this.n21 = f * e + o * g + r * i;
            this.n22 = f * m + o * k + r * l;
            this.n23 = f * q + o * t + r * u;
            this.n24 = f * w + o * x + r * y + z;
            this.n31 = h * e + p * g + s * i;
            this.n32 = h * m + p * k + s * l;
            this.n33 = h * q + p * t + s * u;
            this.n34 = h * w + p * x + s * y + A
        };
        a.Matrix4.prototype.multiply = function(a, b) {
            this.calculateMultiply(a, b);
            return this
        };
        a.Matrix4.prototype.multiplyVector = function(a, b) {
            var d = b.x,
                e = b.y,
                f = b.z;
            b.x = d * a.n11 + e * a.n12 + f * a.n13 + a.n14;
            b.y = d * a.n21 + e * a.n22 + f * a.n23 + a.n24;
            b.z = d * a.n31 + e * a.n32 + f * a.n33 + a.n34
        }
    })(MOD3);
    (function(a) {
        a.VertexProxy = function(a) {
            this.originalZ = this.originalY = this.originalX = this.ratioZ = this.ratioY = this.ratioX = null;
            if (typeof a != "undefined") this.vertex = a
        };
        a.VertexProxy.prototype.setVertex = function() {};
        a.VertexProxy.prototype.setRatios = function(a, b, d) {
            this.ratioX = a;
            this.ratioY = b;
            this.ratioZ = d
        };
        a.VertexProxy.prototype.setOriginalPosition = function(a, b, d) {
            this.originalX = a;
            this.originalY = b;
            this.originalZ = d
        };
        a.VertexProxy.prototype.getX = function() {};
        a.VertexProxy.prototype.getY = function() {};
        a.VertexProxy.prototype.getZ = function() {};
        a.VertexProxy.prototype.setX = function() {};
        a.VertexProxy.prototype.setY = function() {};
        a.VertexProxy.prototype.setZ = function() {};
        a.VertexProxy.prototype.getValue = function(c) {
            switch (c) {
                case a.ModConstant.X:
                    return this.getX();
                case a.ModConstant.Y:
                    return this.getY();
                case a.ModConstant.Z:
                    return this.getZ()
            }
            return 0
        };
        a.VertexProxy.prototype.setValue = function(c, b) {
            switch (c) {
                case a.ModConstant.X:
                    this.setX(b);
                    break;
                case a.ModConstant.Y:
                    this.setY(b);
                    break;
                case a.ModConstant.Z:
                    this.setZ(b)
            }
        };
        a.VertexProxy.prototype.getRatio = function(c) {
            switch (c) {
                case a.ModConstant.X:
                    return this.ratioX;
                case a.ModConstant.Y:
                    return this.ratioY;
                case a.ModConstant.Z:
                    return this.ratioZ
            }
            return -1
        };
        a.VertexProxy.prototype.getOriginalValue = function(c) {
            switch (c) {
                case a.ModConstant.X:
                    return this.originalX;
                case a.ModConstant.Y:
                    return this.originalY;
                case a.ModConstant.Z:
                    return this.originalZ
            }
            return 0
        };
        a.VertexProxy.prototype.reset = function() {
            this.setX(this.originalX);
            this.setY(this.originalY);
            this.setZ(this.originalZ)
        };
        a.VertexProxy.prototype.collapse = function() {
            this.originalX = this.getX();
            this.originalY = this.getY();
            this.originalZ = this.getZ()
        };
        a.VertexProxy.prototype.getVector = function() {
            return new a.Vector3(this.getX(), this.getY(), this.getZ())
        };
        a.VertexProxy.prototype.setVector = function(a) {
            this.setX(a.x);
            this.setY(a.y);
            this.setZ(a.z)
        };
        a.VertexProxy.prototype.getRatioVector = function() {
            return new a.Vector3(this.ratioX, this.ratioY, this.ratioZ)
        }
    })(MOD3);
    (function(a) {
        a.FaceProxy = function() {
            this.vertices = []
        };
        a.FaceProxy.prototype.addVertex = function(a) {
            this.vertices.push(a)
        };
        a.FaceProxy.prototype.getVertices = function() {
            return this.vertices
        }
    })(MOD3);
    (function(a) {
        a.MeshProxy = function() {
            this.depth = this.height = this.width = this.minAxis = this.midAxis = this.maxAxis = this.minZ = this.minY = this.minX = this.maxZ = this.maxY = this.maxX = null;
            this.vertices = [];
            this.faces = [];
            this.mesh = null
        };
        a.MeshProxy.prototype.getVertices = function() {
            return this.vertices
        };
        a.MeshProxy.prototype.getFaces = function() {
            return this.faces
        };
        a.MeshProxy.prototype.analyzeGeometry = function() {
            for (var c = this.getVertices(), b = c.length, d = b, e, f, g, h, i, n, m, o, k, p, l = !0, j = Math.min, q = Math.max; --d >= 0;) e = c[d],
                f = e.getX(), g = e.getY(), h = e.getZ(), l ? (i = n = f, m = o = g, k = p = h, l = !1) : (i = j(i, f), m = j(m, g), k = j(k, h), n = q(n, f), o = q(o, g), p = q(p, h)), e.setOriginalPosition(f, g, h);
            f = n - i;
            g = o - m;
            depth = p - k;
            this.width = f;
            this.height = g;
            this.depth = depth;
            this.minX = i;
            this.maxX = n;
            this.minY = m;
            this.maxY = o;
            this.minZ = k;
            this.maxZ = p;
            d = q(f, q(g, depth));
            j = j(f, j(g, depth));
            if (d == f && j == g) this.minAxis = a.ModConstant.Y, this.midAxis = a.ModConstant.Z, this.maxAxis = a.ModConstant.X;
            else if (d == f && j == depth) this.minAxis = a.ModConstant.Z, this.midAxis = a.ModConstant.Y,
                this.maxAxis = a.ModConstant.X;
            else if (d == g && j == f) this.minAxis = a.ModConstant.X, this.midAxis = a.ModConstant.Z, this.maxAxis = a.ModConstant.Y;
            else if (d == g && j == depth) this.minAxis = a.ModConstant.Z, this.midAxis = a.ModConstant.X, this.maxAxis = a.ModConstant.Y;
            else if (d == depth && j == f) this.minAxis = a.ModConstant.X, this.midAxis = a.ModConstant.Y, this.maxAxis = a.ModConstant.Z;
            else if (d == depth && j == g) this.minAxis = a.ModConstant.Y, this.midAxis = a.ModConstant.X, this.maxAxis = a.ModConstant.Z;
            for (d = b; --d >= 0;) e = c[d], e.setRatios((e.getX() -
                i) / f, (e.getY() - m) / g, (e.getZ() - k) / depth)
        };
        a.MeshProxy.prototype.resetGeometry = function() {
            for (var a = this.getVertices(), b = a.length; --b >= 0;) a[b].reset()
        };
        a.MeshProxy.prototype.collapseGeometry = function() {
            for (var a = this.getVertices(), b = a.length; --b >= 0;) a[b].collapse();
            this.analyzeGeometry()
        };
        a.MeshProxy.prototype.getMin = function(c) {
            switch (c) {
                case a.ModConstant.X:
                    return this.minX;
                case a.ModConstant.Y:
                    return this.minY;
                case a.ModConstant.Z:
                    return this.minZ
            }
            return -1
        };
        a.MeshProxy.prototype.getMax = function(c) {
            switch (c) {
                case a.ModConstant.X:
                    return this.maxX;
                case a.ModConstant.Y:
                    return this.maxY;
                case a.ModConstant.Z:
                    return this.maxZ
            }
            return -1
        };
        a.MeshProxy.prototype.getSize = function(c) {
            switch (c) {
                case a.ModConstant.X:
                    return this.width;
                case a.ModConstant.Y:
                    return this.height;
                case a.ModConstant.Z:
                    return this.depth
            }
            return -1
        };
        a.MeshProxy.prototype.setMesh = function(a) {
            this.mesh = a;
            this.vertices = [];
            this.faces = []
        };
        a.MeshProxy.prototype.postApply = function() {};
        a.MeshProxy.prototype.updateMeshPosition = function() {}
    })(MOD3);
    (function(a) {
        a.Modifier = function() {
            this.mod = null
        };
        a.Modifier.prototype.setModifiable = function(a) {
            this.mod = a
        };
        a.Modifier.prototype.getVertices = function() {
            return this.mod.getVertices()
        };
        a.Modifier.prototype.apply = function() {}
    })(MOD3);
    (function(a) {
        a.Library3d = function() {
            this.id = "";
            this.vertexClass = this.meshClass = null
        }
    })(MOD3);
    (function(a) {
        a.PluginFactory = {};
        a.PluginFactory.getMeshProxy = function(a) {
            return new a.meshClass
        }
    })(MOD3);
    (function(a) {
        a.ModifierStack = function(c, b) {
            this.lib3d = c;
            this.stack = this.baseMesh = null;
            this.baseMesh = a.PluginFactory.getMeshProxy(c);
            this.baseMesh.setMesh(b);
            this.baseMesh.analyzeGeometry();
            this.stack = []
        };
        a.ModifierStack.prototype.addModifier = function(a) {
            a.setModifiable(this.baseMesh);
            this.stack.push(a)
        };
        a.ModifierStack.prototype.apply = function() {
            this.baseMesh.resetGeometry();
            for (var a = this.stack, b = a.length, d = 0; d < b;) a[d++].apply();
            this.baseMesh.postApply()
        };
        a.ModifierStack.prototype.collapse = function() {
            this.apply();
            this.baseMesh.collapseGeometry();
            this.stack = []
        };
        a.ModifierStack.prototype.clear = function() {
            this.stack = []
        };
        a.ModifierStack.prototype.getMeshInfo = function() {
            return this.baseMesh
        }
    })(MOD3);
    (function(a) {
        a.Pivot = function(c, b, d) {
            this.pivot = new a.Vector3(c, b, d)
        };
        a.Pivot.prototype = new a.Modifier;
        a.Pivot.prototype.constructor = a.Pivot;
        a.Pivot.prototype.setMeshCenter = function() {
            var c = this.mod;
            this.pivot = new a.Vector3(-(c.minX + 0.5 * c.width), -(c.minY + 0.5 * c.height), -(c.minZ + 0.5 * c.depth))
        };
        a.Pivot.prototype.apply = function() {
            for (var a = this.mod.getVertices(), b = a.length, d = this.pivot, e, f; --b >= 0;) e = a[b], f = e.getVector().clone(), e.setVector(f.add(d));
            this.mod.updateMeshPosition(d.clone().negate())
        }
    })(MOD3);
    (function(a) {
        a.Bend = function(c, b, d) {
            this.diagAngle = this.angle = this.offset = this.force = null;
            this.constraint = a.ModConstant.NONE;
            this.m2 = this.m1 = this.origin = this.height = this.width = this.mid = this.min = this.max = null;
            this.switchAxes = !1;
            this.force = c;
            this.offset = b;
            this.setAngle(d)
        };
        a.Bend.prototype = new a.Modifier;
        a.Bend.prototype.constructor = a.Bend;
        a.Bend.prototype.setAngle = function(c) {
            this.angle = c;
            this.m1 = new a.Matrix;
            this.m1.rotate(c);
            this.m2 = new a.Matrix;
            this.m2.rotate(-c)
        };
        a.Bend.prototype.setModifiable =
            function(c) {
                a.Modifier.prototype.setModifiable.call(this, c);
                this.max = this.switchAxes ? this.mod.midAxis : this.mod.maxAxis;
                this.min = this.mod.minAxis;
                this.mid = this.switchAxes ? this.mod.maxAxis : this.mod.midAxis;
                this.width = this.mod.getSize(this.max);
                this.height = this.mod.getSize(this.mid);
                this.origin = this.mod.getMin(this.max);
                this.diagAngle = Math.atan(this.width / this.height)
            };
        a.Bend.prototype.apply = function() {
            if (this.force != 0)
                for (var c = this.mod.getVertices(), b = c.length, d = this.width, e = this.offset, f = this.origin,
                        g = this.max, h = this.min, i = this.mid, n = this.m1, m = this.m2, o = f + d * e, k = d / Math.PI / this.force, p = a.Constants.doublePI * (d / (k * a.Constants.doublePI)), l, j, q, r, t = 1 / d, s = a.Constants.halfPI, u = Math.sin, v = Math.cos; --b >= 0;) d = c[b], l = d.getValue(g), j = d.getValue(i), q = d.getValue(h), j = n.transformPoint(new a.Point(l, j)), l = j.x, j = j.y, r = (l - f) * t, this.constraint == a.ModConstant.LEFT && r <= e || this.constraint == a.ModConstant.RIGHT && r >= e || (r = s - p * e + p * r, l = u(r) * (k + q), r = v(r) * (k + q), q = l - k, l = o - r), j = m.transformPoint(new a.Point(l, j)), l = j.x, j = j.y,
                    d.setValue(g, l), d.setValue(i, j), d.setValue(h, q)
        }
    })(MOD3);
    (function(a) {
        a.Bloat = function() {
            this.center = a.Vector3.ZERO();
            this.radius = 0;
            this.a = 0.01;
            this.u = a.Vector3.ZERO()
        };
        a.Bloat.prototype = new a.Modifier;
        a.Bloat.prototype.constructor = a.Bloat;
        a.Bloat.prototype.setRadius = function(a) {
            this.radius = Math.max(0, a)
        };
        a.Bloat.prototype.setA = function(a) {
            this.a = Math.max(0, a)
        };
        a.Bloat.prototype.apply = function() {
            for (var a = this.mod.getVertices(), b = a.length, d = this.center, e = this.radius, f = this.a, g, h; --b >= 0;) g = a[b], this.u.x = g.getX() - d.x, this.u.y = g.getY() - d.y, this.u.z = g.getZ() -
                d.z, h = this.u.getMagnitude(), this.u.setMagnitude(h + e * Math.exp(-h * f)), g.setX(this.u.x + d.x), g.setY(this.u.y + d.y), g.setZ(this.u.z + d.z)
        }
    })(MOD3);
    (function(a) {
        a.Twist = function(c) {
            this.vector = new a.Vector3(0, 1, 0);
            this.angle = c;
            this.center = a.Vector3.ZERO()
        };
        a.Twist.prototype = new a.Modifier;
        a.Twist.prototype.constructor = a.Twist;
        a.Twist.prototype.apply = function() {
            this.vector.normalize();
            for (var c = this.mod, b = c.getVertices(), d = b.length, e = this.vector, f = this.angle, g = this.center, c = 1 / (new a.Vector3(0.5 * c.maxX, 0.5 * c.maxY, 0.5 * c.maxZ)).getMagnitude() * f, g = -a.Vector3.dot(e, g), h; --d >= 0;) f = b[d], h = f.getX() * e.x + f.getY() * e.y + f.getZ() * e.z + g, this.twistPoint(f, h *
                c)
        };
        a.Twist.prototype.twistPoint = function(c, b) {
            var d = (new a.Matrix4).translationMatrix(c.getX(), c.getY(), c.getZ()),
                d = (new a.Matrix4).multiply((new a.Matrix4).rotationMatrix(this.vector.x, this.vector.y, this.vector.z, b), d);
            c.setX(d.n14);
            c.setY(d.n24);
            c.setZ(d.n34)
        }
    })(MOD3);
    (function(a) {
        a.Skew = function(c) {
            this.force = 0;
            this.skewAxis = null;
            if (typeof c != "undefined") this.force = c;
            this.offset = 0.5;
            this.constraint = a.ModConstant.NONE;
            this.falloff = this.power = 1;
            this.swapAxes = this.oneSide = this.inverseFalloff = !1
        };
        a.Skew.prototype = new a.Modifier;
        a.Skew.prototype.constructor = a.Skew;
        a.Skew.prototype.setModifiable = function(c) {
            a.Modifier.prototype.setModifiable.call(this, c);
            this.skewAxis = this.skewAxis || this.mod.maxAxis
        };
        a.Skew.prototype.apply = function() {
            for (var c = this.mod.getVertices(),
                    b = c.length, d = this.constraint, e = this.skewAxis, f = this.offset, g = this.oneSide, h = this.inverseFalloff, i = this.falloff, n = 1 - i, m = this.power, o = this.force, k = this.getDisplaceAxis(), p, l, j; --b >= 0;) p = c[b], !(d == a.ModConstant.LEFT && p.getRatio(e) <= f) && !(d == a.ModConstant.RIGHT && p.getRatio(e) > f) && (l = p.getRatio(e) - f, g && (l = Math.abs(l)), j = p.getRatio(k), h && (j = 1 - j), j = i + j * n, l = Math.pow(Math.abs(l), m) * a.XMath.sign(l, 1), l = p.getValue(k) + o * l * j, p.setValue(k, l))
        };
        a.Skew.prototype.getDisplaceAxis = function() {
            switch (this.skewAxis) {
                case a.ModConstant.X:
                    return this.swapAxes ?
                        a.ModConstant.Z : a.ModConstant.Y;
                case a.ModConstant.Y:
                    return this.swapAxes ? a.ModConstant.Z : a.ModConstant.X;
                case a.ModConstant.Z:
                    return this.swapAxes ? a.ModConstant.Y : a.ModConstant.X;
                default:
                    return 0
            }
        }
    })(MOD3);
    (function(a) {
        a.Taper = function(c) {
            this.power = this.force = null;
            this.start = 0;
            this.end = 1;
            this.vector = new a.Vector3(1, 0, 1);
            this.vector2 = new a.Vector3(0, 1, 0);
            if (typeof c != "undefined") this.force = c;
            this.power = 1
        };
        a.Taper.prototype = new a.Modifier;
        a.Taper.prototype.constructor = a.Taper;
        a.Taper.prototype.setFalloff = function(a, b) {
            this.start = 0;
            this.end = 1;
            if (typeof a != "undefined") this.start = a;
            if (typeof b != "undefined") this.end = b
        };
        a.Taper.prototype.apply = function() {
            for (var c = this.mod.getVertices(), b = c.length, d = this.vector,
                    e = this.vector2, f = this.force, g = this.power, h, i, n; --b >= 0;) h = c[b], i = h.getRatioVector().multiply(e), i = f * Math.pow(i.getMagnitude(), g), i = (new a.Matrix4).scaleMatrix(1 + i * d.x, 1 + i * d.y, 1 + i * d.z), n = h.getVector(), (new a.Matrix4).multiplyVector(i, n), h.setVector(n)
        }
    })(MOD3);
    (function(a) {
        a.Wheel = function() {
            this.radius = this.roll = this.turn = this.speed = null;
            this.steerVector = new a.Vector3(0, 1, 0);
            this.rollVector = new a.Vector3(0, 0, 1);
            this.roll = this.turn = this.speed = 0
        };
        a.Wheel.prototype = new a.Modifier;
        a.Wheel.prototype.constructor = a.Wheel;
        a.Wheel.prototype.setModifiable = function(c) {
            a.Modifier.prototype.setModifiable.call(this, c);
            this.radius = 0.5 * this.mod.width
        };
        a.Wheel.prototype.apply = function() {
            this.roll += this.speed;
            var c = this.mod.getVertices(),
                b = c.length,
                d = this.steerVector,
                e =
                this.turn,
                f = this.rollVector,
                g = this.roll,
                h;
            0 != e ? (h = (new a.Matrix4).rotationMatrix(d.x, d.y, d.z, e), d = f.clone(), (new a.Matrix4).multiplyVector(h, d), g = (new a.Matrix4).rotationMatrix(d.x, d.y, d.z, g)) : g = (new a.Matrix4).rotationMatrix(f.x, f.y, f.z, g);
            for (; --b >= 0;) d = c[b], f = d.getVector().clone(), 0 != e && (new a.Matrix4).multiplyVector(h, f), (new a.Matrix4).multiplyVector(g, f), d.setX(f.x), d.setY(f.y), d.setZ(f.z)
        };
        a.Wheel.prototype.getStep = function() {
            return this.radius * this.speed * a.Constants.invPI
        };
        a.Wheel.prototype.getPerimeter =
            function() {
                return this.radius * a.Constants.doublePI
            }
    })(MOD3);
    (function(a) {
        a.Break = function(c, b) {
            this.bv = new a.Vector3(0, 1, 0);
            this.angle = this.offset = 0;
            if (typeof c != "undefined") this.offset = c;
            if (typeof b != "undefined") this.angle = b;
            this.range = new a.Range(0, 1)
        };
        a.Break.prototype = new a.Modifier;
        a.Break.prototype.constructor = a.Break;
        a.Break.prototype.apply = function() {
            var c = this.mod,
                b = c.getVertices(),
                d = b.length,
                e = this.range,
                f = this.angle,
                g = this.bv,
                h, i, c = new a.Vector3(0, 0, -(c.minZ + c.depth * this.offset));
            h = c.negate();
            for (i = (new a.Matrix4).rotationMatrix(g.x, g.y, g.z, f); --d >=
                0;) f = b[d], g = f.getVector(), g = g.add(c), g.z >= 0 && e.isIn(f.ratioY) && (new a.Matrix4).multiplyVector(i, g), g = g.add(h), f.setX(g.x), f.setY(g.y), f.setZ(g.z)
        }
    })(MOD3);
    (function(a) {
        a.Noise = function(c) {
            this.force = 0;
            this.axc = a.ModConstant.NONE;
            this.end = this.start = 0;
            if (typeof c != "undefined") this.force = c
        };
        a.Noise.prototype = new a.Modifier;
        a.Noise.prototype.constructor = a.Noise;
        a.Noise.prototype.constraintAxes = function(a) {
            this.axc = a
        };
        a.Noise.prototype.setFalloff = function(a, b) {
            this.start = 0;
            this.end = 1;
            if (typeof a != "undefined") this.start = a;
            if (typeof b != "undefined") this.end = b
        };
        a.Noise.prototype.apply = function() {
            for (var a = this.mod, b = this.axc, d = this.start, e = this.end, f = a.getVertices(),
                    g = f.length, h = this.force, i = 0.5 * h, n = Math.random, m, o, k; --g >= 0;) m = f[g], o = n() * h - i, k = m.getRatio(a.maxAxis), d < e ? (k < d && (k = 0), k > e && (k = 1)) : d > e ? (k = 1 - k, k > d && (k = 0), k < e && (k = 1)) : k = 1, b & 1 || m.setX(m.getX() + o * k), b >> 1 & 1 || m.setY(m.getY() + o * k), b >> 2 & 1 || m.setZ(m.getZ() + o * k)
        }
    })(MOD3);
    (function(a) {
        a.LibraryThree = function() {
            this.id = "Three.js";
            this.meshClass = a.MeshThree;
            this.vertexClass = a.VertexThree
        };
        a.LibraryThree.prototype = new a.Library3d;
        a.LibraryThree.prototype.constructor = a.LibraryThree
    })(MOD3);
    (function(a) {
        a.VertexThree = function(a) {
            this.mesh = a
        };
        a.VertexThree.prototype = new a.VertexProxy;
        a.VertexThree.prototype.setVertex = function(a) {
            this.vertex = a;
            this.originalX = a.x;
            this.originalY = a.y;
            this.originalZ = a.z
        };
        a.VertexThree.prototype.getX = function() {
            return this.vertex.x
        };
        a.VertexThree.prototype.getY = function() {
            return this.vertex.y
        };
        a.VertexThree.prototype.getZ = function() {
            return this.vertex.z
        };
        a.VertexThree.prototype.setX = function(a) {
            this.vertex.x = a;
            a = this.mesh;
            a.geometry.verticesNeedUpdate = !0;
            a.geometry.normalsNeedUpdate = !0;
            a.geometry.buffersNeedUpdate = !0;
            a.geometry.dynamic = !0
        };
        a.VertexThree.prototype.setY = function(a) {
            this.vertex.y = a;
            a = this.mesh;
            a.geometry.verticesNeedUpdate = !0;
            a.geometry.normalsNeedUpdate = !0;
            a.geometry.buffersNeedUpdate = !0;
            a.geometry.dynamic = !0
        };
        a.VertexThree.prototype.setZ = function(a) {
            this.vertex.z = a;
            a = this.mesh;
            a.geometry.verticesNeedUpdate = !0;
            a.geometry.normalsNeedUpdate = !0;
            a.geometry.buffersNeedUpdate = !0;
            a.geometry.dynamic = !0
        }
    })(MOD3);
    (function(a) {
        a.MeshThree = function() {};
        a.MeshThree.prototype = new a.MeshProxy;
        a.MeshThree.prototype.setMesh = function(c) {
            a.MeshProxy.prototype.setMesh.call(this, c);
            for (var c = [], b = 0, d = this.mesh.geometry.vertices, e = d.length, f = this.mesh.geometry.faces, g = f.length, h, b = 0; b < e;) h = new a.VertexThree(this.mesh), h.setVertex(d[b]), this.vertices.push(h), c[d[b]] = h, b++;
            for (b = 0; b < g;) e = new a.FaceProxy, f[b] instanceof THREE.Face3 ? (e.addVertex(c[d[f[b].a]]), e.addVertex(c[d[f[b].b]]), e.addVertex(c[d[f[b].c]])) : f[b] instanceof
            THREE.Face4 && (e.addVertex(c[d[f[b].a]]), e.addVertex(c[d[f[b].b]]), e.addVertex(c[d[f[b].c]]), e.addVertex(c[d[f[b].d]])), this.faces.push(e), b++;
            delete lookup
        };
        a.MeshThree.prototype.updateMeshPosition = function(a) {
            var b = this.mesh;
            b.position.x += a.x;
            b.position.y += a.y;
            b.position.z += a.z
        }
    })(MOD3);
    (function(a) {
        a.LibraryPre3D = function() {
            this.id = "pre3d.js";
            this.meshClass = a.MeshPre3D;
            this.vertexClass = a.VertexPre3D
        };
        a.LibraryThree.prototype = new a.Library3d;
        a.LibraryThree.prototype.constructor = a.LibraryPre3D
    })(MOD3);
    (function(a) {
        a.VertexPre3D = function() {};
        a.VertexPre3D.prototype = new a.VertexProxy;
        a.VertexPre3D.prototype.setVertex = function(a) {
            this.vertex = a;
            this.originalX = a.x;
            this.originalY = a.y;
            this.originalZ = a.z
        };
        a.VertexPre3D.prototype.getX = function() {
            return this.vertex.x
        };
        a.VertexPre3D.prototype.getY = function() {
            return this.vertex.y
        };
        a.VertexPre3D.prototype.getZ = function() {
            return this.vertex.z
        };
        a.VertexPre3D.prototype.setX = function(a) {
            this.vertex.x = a
        };
        a.VertexPre3D.prototype.setY = function(a) {
            this.vertex.y = a
        };
        a.VertexPre3D.prototype.setZ = function(a) {
            this.vertex.z = a
        }
    })(MOD3);
    (function(a) {
        a.MeshPre3D = function() {};
        a.MeshPre3D.prototype = new a.MeshProxy;
        a.MeshPre3D.prototype.setMesh = function(c) {
            a.MeshProxy.prototype.setMesh.call(this, c);
            for (var c = [], b = this.mesh.vertices, d = this.mesh.quads, e = b.length, f = d.length, g = 0; g < e; g++) {
                var h = new a.VertexPre3D;
                h.setVertex(b[g]);
                this.vertices.push(h);
                c[b[g]] = h
            }
            for (g = 0; g < f; g++) e = new a.FaceProxy, d[g] instanceof Pre3d.QuadFace && (e.addVertex(c[b[d[g].i0]]), e.addVertex(c[b[d[g].i1]]), e.addVertex(c[b[d[g].i2]]), d[g].i3 != null && e.addVertex(c[b[d[g].i3]])),
                this.faces.push(e);
            delete lookup
        };
        a.MeshPre3D.prototype.updateMeshPosition = function() {}
    })(MOD3);
    (function(a) {
        a.LibraryJ3D = function() {
            this.id = "J3D";
            this.meshClass = a.MeshJ3D;
            this.vertexClass = a.VertexJ3D
        };
        a.LibraryJ3D.prototype = new a.Library3d;
        a.LibraryJ3D.prototype.constructor = a.LibraryJ3D
    })(MOD3);
    (function(a) {
        a.VertexJ3D = function(a) {
            this.geometry = a
        };
        a.VertexJ3D.prototype = new a.VertexProxy;
        a.VertexJ3D.prototype.setVertex = function(a) {
            this.vertex = a;
            var b = this.geometry;
            this.originalX = b.vertexPositionBuffer.data[a];
            this.originalY = b.vertexPositionBuffer.data[a + 1];
            this.originalZ = b.vertexPositionBuffer.data[a + 2]
        };
        a.VertexJ3D.prototype.getX = function() {
            return this.geometry.vertexPositionBuffer.data[this.vertex]
        };
        a.VertexJ3D.prototype.getY = function() {
            return this.geometry.vertexPositionBuffer.data[this.vertex +
                1]
        };
        a.VertexJ3D.prototype.getZ = function() {
            return this.geometry.vertexPositionBuffer.data[this.vertex + 2]
        };
        a.VertexJ3D.prototype.setX = function(a) {
            var b = this.geometry;
            b.vertexPositionBuffer.data[this.vertex] = a;
            b.replaceArray(b.vertexPositionBuffer, b.vertexPositionBuffer.data)
        };
        a.VertexJ3D.prototype.setY = function(a) {
            var b = this.geometry;
            b.vertexPositionBuffer.data[this.vertex + 1] = a;
            b.replaceArray(b.vertexPositionBuffer, b.vertexPositionBuffer.data)
        };
        a.VertexJ3D.prototype.setZ = function(a) {
            var b = this.geometry;
            b.vertexPositionBuffer.data[this.vertex + 2] = a;
            b.replaceArray(b.vertexPositionBuffer, b.vertexPositionBuffer.data)
        }
    })(MOD3);
    (function(a) {
        a.MeshJ3D = function() {};
        a.MeshJ3D.prototype = new a.MeshProxy;
        a.MeshJ3D.prototype.setMesh = function(c) {
            a.MeshProxy.prototype.setMesh.call(this, c);
            for (var b = 0, d = c.geometry.vertexPositionBuffer.data.length, e = c.geometry.vertexPositionBuffer.itemSize, f, b = 0; b < d;) f = new a.VertexJ3D(c.geometry), f.setVertex(b), this.vertices.push(f), b += e;
            this.faces = null
        };
        a.MeshJ3D.prototype.updateMeshPosition = function(a) {
            var b = this.mesh;
            b.position.x += a.x;
            b.position.y += a.y;
            b.position.z += a.z
        }
    })(MOD3);
    (function(a) {
        a.LibraryCopperlicht = function() {
            this.id = "Copperlicht";
            this.meshClass = a.MeshCopperlicht;
            this.vertexClass = a.VertexCopperlicht
        };
        a.LibraryCopperlicht.prototype = new a.Library3d;
        a.LibraryCopperlicht.prototype.constructor = a.LibraryCopperlicht
    })(MOD3);
    (function(a) {
        a.VertexCopperlicht = function(a, b) {
            this.node = a;
            this.buffer = b
        };
        a.VertexCopperlicht.prototype = new a.VertexProxy;
        a.VertexCopperlicht.prototype.setVertex = function(a) {
            this.vertex = a;
            this.originalX = this.vertex.Pos.X;
            this.originalY = this.vertex.Pos.Y;
            this.originalZ = this.vertex.Pos.Z
        };
        a.VertexCopperlicht.prototype.getX = function() {
            return this.vertex.Pos.X
        };
        a.VertexCopperlicht.prototype.getY = function() {
            return this.vertex.Pos.Y
        };
        a.VertexCopperlicht.prototype.getZ = function() {
            return this.vertex.Pos.Z
        };
        a.VertexCopperlicht.prototype.setX = function(a) {
            this.vertex.Pos.X = a;
            this.buffer.update(!0)
        };
        a.VertexCopperlicht.prototype.setY = function(a) {
            this.vertex.Pos.Y = a;
            this.buffer.update(!0)
        };
        a.VertexCopperlicht.prototype.setZ = function(a) {
            this.vertex.Pos.Z = a;
            this.buffer.update(!0)
        }
    })(MOD3);
    (function(a) {
        a.MeshCopperlicht = function() {};
        a.MeshCopperlicht.prototype = new a.MeshProxy;
        a.MeshCopperlicht.prototype.setMesh = function(c) {
            a.MeshProxy.prototype.setMesh.call(this, c);
            for (var c = this.mesh.getMesh().GetMeshBuffers(), b = [], d = 0; d < c.length; d++)
                for (var b = c[d].Vertices, e = b.length, f = 0; f < e; f++) {
                    var g = new a.VertexCopperlicht(this.mesh, c[d]);
                    g.setVertex(b[f]);
                    this.vertices.push(g)
                }
            this.faces = null;
            delete lookup
        };
        a.MeshCopperlicht.prototype.updateMeshPosition = function(a) {
            this.mesh.Pos.X += a.x;
            this.mesh.Pos.Y +=
                a.y;
            this.mesh.Pos.Z += a.z
        }
    })(MOD3);
}



{
    /**
     * Tween.js - Licensed under the MIT license
     * https://github.com/sole/tween.js
     * ----------------------------------------------
     *
     * See https://github.com/sole/tween.js/graphs/contributors for the full list of contributors.
     * Thank you all, you're awesome!
     */

    // performance.now polyfill
    (function(root) {

        if ('performance' in root === false) {
            root.performance = {};
        }

        // IE 8
        Date.now = (Date.now || function() {
            return new Date().getTime();
        });

        if ('now' in root.performance === false) {
            var offset = root.performance.timing && root.performance.timing.navigationStart ? performance.timing.navigationStart : Date.now();

            root.performance.now = function() {
                return Date.now() - offset;
            };
        }

    })(this);

    FLIPBOOK.TWEEN = FLIPBOOK.TWEEN || (function() {

        var _tweens = [];

        return {

            REVISION: '14',

            getAll: function() {

                return _tweens;

            },

            removeAll: function() {

                _tweens = [];

            },

            add: function(tween) {

                _tweens.push(tween);

            },

            remove: function(tween) {

                var i = _tweens.indexOf(tween);

                if (i !== -1) {

                    _tweens.splice(i, 1);

                }

            },

            update: function(time) {

                if (_tweens.length === 0) return false;

                var i = 0;

                time = time !== undefined ? time : window.performance.now();

                while (i < _tweens.length) {

                    if (_tweens[i].update(time)) {

                        i++;

                    } else {

                        _tweens.splice(i, 1);

                    }

                }

                return true;

            }
        };

    })();

    FLIPBOOK.TWEEN.Tween = function(object) {

        var _object = object;
        var _valuesStart = {};
        var _valuesEnd = {};
        var _valuesStartRepeat = {};
        var _duration = 1000;
        var _repeat = 0;
        var _yoyo = false;
        var _isPlaying = false;
        var _reversed = false;
        var _delayTime = 0;
        var _startTime = null;
        var _easingFunction = FLIPBOOK.TWEEN.Easing.Linear.None;
        var _interpolationFunction = FLIPBOOK.TWEEN.Interpolation.Linear;
        var _chainedTweens = [];
        var _onStartCallback = null;
        var _onStartCallbackFired = false;
        var _onUpdateCallback = null;
        var _onCompleteCallback = null;
        var _onStopCallback = null;

        // Set all starting values present on the target object
        for (var field in object) {

            _valuesStart[field] = parseFloat(object[field], 10);

        }

        this.to = function(properties, duration) {

            if (duration !== undefined) {

                _duration = duration;

            }

            _valuesEnd = properties;

            return this;

        };

        this.start = function(time) {

            FLIPBOOK.TWEEN.add(this);

            _isPlaying = true;

            _onStartCallbackFired = false;

            _startTime = time !== undefined ? time : window.performance.now();
            _startTime += _delayTime;

            for (var property in _valuesEnd) {

                // check if an Array was provided as property value
                if (_valuesEnd[property] instanceof Array) {

                    if (_valuesEnd[property].length === 0) {

                        continue;

                    }

                    // create a local copy of the Array with the start value at the front
                    _valuesEnd[property] = [_object[property]].concat(_valuesEnd[property]);

                }

                _valuesStart[property] = _object[property];

                if ((_valuesStart[property] instanceof Array) === false) {
                    _valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
                }

                _valuesStartRepeat[property] = _valuesStart[property] || 0;

            }

            return this;

        };

        this.stop = function() {

            if (!_isPlaying) {
                return this;
            }

            FLIPBOOK.TWEEN.remove(this);
            _isPlaying = false;

            if (_onStopCallback !== null) {

                _onStopCallback.call(_object);

            }

            this.stopChainedTweens();
            return this;

        };

        this.stopChainedTweens = function() {

            for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {

                _chainedTweens[i].stop();

            }

        };

        this.delay = function(amount) {

            _delayTime = amount;
            return this;

        };

        this.repeat = function(times) {

            _repeat = times;
            return this;

        };

        this.yoyo = function(yoyo) {

            _yoyo = yoyo;
            return this;

        };


        this.easing = function(easing) {

            _easingFunction = easing;
            return this;

        };

        this.interpolation = function(interpolation) {

            _interpolationFunction = interpolation;
            return this;

        };

        this.chain = function() {

            _chainedTweens = arguments;
            return this;

        };

        this.onStart = function(callback) {

            _onStartCallback = callback;
            return this;

        };

        this.onUpdate = function(callback) {

            _onUpdateCallback = callback;
            return this;

        };

        this.onComplete = function(callback) {

            _onCompleteCallback = callback;
            return this;

        };

        this.onStop = function(callback) {

            _onStopCallback = callback;
            return this;

        };

        this.update = function(time) {

            var property;

            if (time < _startTime) {

                return true;

            }

            if (_onStartCallbackFired === false) {

                if (_onStartCallback !== null) {

                    _onStartCallback.call(_object);

                }

                _onStartCallbackFired = true;

            }

            var elapsed = (time - _startTime) / _duration;
            elapsed = elapsed > 1 ? 1 : elapsed;

            var value = _easingFunction(elapsed);

            for (property in _valuesEnd) {

                var start = _valuesStart[property] || 0;
                var end = _valuesEnd[property];

                if (end instanceof Array) {

                    _object[property] = _interpolationFunction(end, value);

                } else {

                    // Parses relative end values with start as base (e.g.: +10, -3)
                    if (typeof(end) === "string") {
                        end = start + parseFloat(end, 10);
                    }

                    // protect against non numeric properties.
                    if (typeof(end) === "number") {
                        _object[property] = start + (end - start) * value;
                    }

                }

            }

            if (_onUpdateCallback !== null) {

                _onUpdateCallback.call(_object, value);

            }

            if (elapsed == 1) {

                if (_repeat > 0) {

                    if (isFinite(_repeat)) {
                        _repeat--;
                    }

                    // reassign starting values, restart by making startTime = now
                    for (property in _valuesStartRepeat) {

                        if (typeof(_valuesEnd[property]) === "string") {
                            _valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property], 10);
                        }

                        if (_yoyo) {
                            var tmp = _valuesStartRepeat[property];
                            _valuesStartRepeat[property] = _valuesEnd[property];
                            _valuesEnd[property] = tmp;
                        }

                        _valuesStart[property] = _valuesStartRepeat[property];

                    }

                    if (_yoyo) {
                        _reversed = !_reversed;
                    }

                    _startTime = time + _delayTime;

                    return true;

                } else {

                    if (_onCompleteCallback !== null) {

                        _onCompleteCallback.call(_object);

                    }

                    for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {

                        _chainedTweens[i].start(time);

                    }

                    return false;

                }

            }

            return true;

        };

    };


    FLIPBOOK.TWEEN.Easing = {

        Linear: {

            None: function(k) {

                return k;

            }

        },

        Quadratic: {

            In: function(k) {

                return k * k;

            },

            Out: function(k) {

                return k * (2 - k);

            },

            InOut: function(k) {

                if ((k *= 2) < 1) return 0.5 * k * k;
                return -0.5 * (--k * (k - 2) - 1);

            }

        },

        Cubic: {

            In: function(k) {

                return k * k * k;

            },

            Out: function(k) {

                return --k * k * k + 1;

            },

            InOut: function(k) {

                if ((k *= 2) < 1) return 0.5 * k * k * k;
                return 0.5 * ((k -= 2) * k * k + 2);

            }

        },

        Quartic: {

            In: function(k) {

                return k * k * k * k;

            },

            Out: function(k) {

                return 1 - (--k * k * k * k);

            },

            InOut: function(k) {

                if ((k *= 2) < 1) return 0.5 * k * k * k * k;
                return -0.5 * ((k -= 2) * k * k * k - 2);

            }

        },

        Quintic: {

            In: function(k) {

                return k * k * k * k * k;

            },

            Out: function(k) {

                return --k * k * k * k * k + 1;

            },

            InOut: function(k) {

                if ((k *= 2) < 1) return 0.5 * k * k * k * k * k;
                return 0.5 * ((k -= 2) * k * k * k * k + 2);

            }

        },

        Sinusoidal: {

            In: function(k) {

                return 1 - Math.cos(k * Math.PI / 2);

            },

            Out: function(k) {

                return Math.sin(k * Math.PI / 2);

            },

            InOut: function(k) {

                return 0.5 * (1 - Math.cos(Math.PI * k));

            }

        },

        Exponential: {

            In: function(k) {

                return k === 0 ? 0 : Math.pow(1024, k - 1);

            },

            Out: function(k) {

                return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);

            },

            InOut: function(k) {

                if (k === 0) return 0;
                if (k === 1) return 1;
                if ((k *= 2) < 1) return 0.5 * Math.pow(1024, k - 1);
                return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);

            }

        },

        Circular: {

            In: function(k) {

                return 1 - Math.sqrt(1 - k * k);

            },

            Out: function(k) {

                return Math.sqrt(1 - (--k * k));

            },

            InOut: function(k) {

                if ((k *= 2) < 1) return -0.5 * (Math.sqrt(1 - k * k) - 1);
                return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

            }

        },

        Elastic: {

            In: function(k) {

                var s, a = 0.1,
                    p = 0.4;
                if (k === 0) return 0;
                if (k === 1) return 1;
                if (!a || a < 1) {
                    a = 1;
                    s = p / 4;
                } else s = p * Math.asin(1 / a) / (2 * Math.PI);
                return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));

            },

            Out: function(k) {

                var s, a = 0.1,
                    p = 0.4;
                if (k === 0) return 0;
                if (k === 1) return 1;
                if (!a || a < 1) {
                    a = 1;
                    s = p / 4;
                } else s = p * Math.asin(1 / a) / (2 * Math.PI);
                return (a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);

            },

            InOut: function(k) {

                var s, a = 0.1,
                    p = 0.4;
                if (k === 0) return 0;
                if (k === 1) return 1;
                if (!a || a < 1) {
                    a = 1;
                    s = p / 4;
                } else s = p * Math.asin(1 / a) / (2 * Math.PI);
                if ((k *= 2) < 1) return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
                return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;

            }

        },

        Back: {

            In: function(k) {

                var s = 1.70158;
                return k * k * ((s + 1) * k - s);

            },

            Out: function(k) {

                var s = 1.70158;
                return --k * k * ((s + 1) * k + s) + 1;

            },

            InOut: function(k) {

                var s = 1.70158 * 1.525;
                if ((k *= 2) < 1) return 0.5 * (k * k * ((s + 1) * k - s));
                return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

            }

        },

        Bounce: {

            In: function(k) {

                return 1 - FLIPBOOK.TWEEN.Easing.Bounce.Out(1 - k);

            },

            Out: function(k) {

                if (k < (1 / 2.75)) {

                    return 7.5625 * k * k;

                } else if (k < (2 / 2.75)) {

                    return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;

                } else if (k < (2.5 / 2.75)) {

                    return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;

                } else {

                    return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;

                }

            },

            InOut: function(k) {

                if (k < 0.5) return FLIPBOOK.TWEEN.Easing.Bounce.In(k * 2) * 0.5;
                return FLIPBOOK.TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;

            }

        }

    };

    FLIPBOOK.TWEEN.Interpolation = {

        Linear: function(v, k) {

            var m = v.length - 1,
                f = m * k,
                i = Math.floor(f),
                fn = FLIPBOOK.TWEEN.Interpolation.Utils.Linear;

            if (k < 0) return fn(v[0], v[1], f);
            if (k > 1) return fn(v[m], v[m - 1], m - f);

            return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

        },

        Bezier: function(v, k) {

            var b = 0,
                n = v.length - 1,
                pw = Math.pow,
                bn = FLIPBOOK.TWEEN.Interpolation.Utils.Bernstein,
                i;

            for (i = 0; i <= n; i++) {
                b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
            }

            return b;

        },

        CatmullRom: function(v, k) {

            var m = v.length - 1,
                f = m * k,
                i = Math.floor(f),
                fn = FLIPBOOK.TWEEN.Interpolation.Utils.CatmullRom;

            if (v[0] === v[m]) {

                if (k < 0) i = Math.floor(f = m * (1 + k));

                return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

            } else {

                if (k < 0) return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
                if (k > 1) return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);

                return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

            }

        },

        Utils: {

            Linear: function(p0, p1, t) {

                return (p1 - p0) * t + p0;

            },

            Bernstein: function(n, i) {

                var fc = FLIPBOOK.TWEEN.Interpolation.Utils.Factorial;
                return fc(n) / fc(i) / fc(n - i);

            },

            Factorial: (function() {

                var a = [1];

                return function(n) {

                    var s = 1,
                        i;
                    if (a[n]) return a[n];
                    for (i = n; i > 1; i--) s *= i;
                    return a[n] = s;

                };

            })(),

            CatmullRom: function(p0, p1, p2, p3, t) {

                var v0 = (p2 - p0) * 0.5,
                    v1 = (p3 - p1) * 0.5,
                    t2 = t * t,
                    t3 = t * t2;
                return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

            }

        }

    };

}

{
    // var _Group=function(){this._tweens={},this._tweensAddedDuringUpdate={}};_Group.prototype={getAll:function(){return Object.keys(this._tweens).map(function(t){return this._tweens[t]}.bind(this))},removeAll:function(){this._tweens={}},add:function(t){this._tweens[t.getId()]=t,this._tweensAddedDuringUpdate[t.getId()]=t},remove:function(t){delete this._tweens[t.getId()],delete this._tweensAddedDuringUpdate[t.getId()]},update:function(t,n){var e=Object.keys(this._tweens);if(0===e.length)return!1;for(t=void 0!==t?t:TWEEN.now();0<e.length;){this._tweensAddedDuringUpdate={};for(var i=0;i<e.length;i++){var r=this._tweens[e[i]];r&&!1===r.update(t)&&(r._isPlaying=!1,n||delete this._tweens[e[i]])}e=Object.keys(this._tweensAddedDuringUpdate)}return!0}};var TWEEN=new _Group;TWEEN.Group=_Group,TWEEN._nextId=0,TWEEN.nextId=function(){return TWEEN._nextId++},"undefined"==typeof window&&"undefined"!=typeof process&&process.hrtime?TWEEN.now=function(){var t=process.hrtime();return 1e3*t[0]+t[1]/1e6}:"undefined"!=typeof window&&void 0!==window.performance&&void 0!==window.performance.now?TWEEN.now=window.performance.now.bind(window.performance):void 0!==Date.now?TWEEN.now=Date.now:TWEEN.now=function(){return(new Date).getTime()},TWEEN.Tween=function(t,n){this._object=t,this._valuesStart={},this._valuesEnd={},this._valuesStartRepeat={},this._duration=1e3,this._repeat=0,this._repeatDelayTime=void 0,this._yoyo=!1,this._isPlaying=!1,this._reversed=!1,this._delayTime=0,this._startTime=null,this._easingFunction=TWEEN.Easing.Linear.None,this._interpolationFunction=TWEEN.Interpolation.Linear,this._chainedTweens=[],this._onStartCallback=null,this._onStartCallbackFired=!1,this._onUpdateCallback=null,this._onCompleteCallback=null,this._onStopCallback=null,this._group=n||TWEEN,this._id=TWEEN.nextId()},TWEEN.Tween.prototype={getId:function(){return this._id},isPlaying:function(){return this._isPlaying},to:function(t,n){return this._valuesEnd=t,void 0!==n&&(this._duration=n),this},start:function(t){for(var n in this._group.add(this),this._isPlaying=!0,this._onStartCallbackFired=!1,this._startTime=void 0!==t?"string"==typeof t?TWEEN.now()+parseFloat(t):t:TWEEN.now(),this._startTime+=this._delayTime,this._valuesEnd){if(this._valuesEnd[n]instanceof Array){if(0===this._valuesEnd[n].length)continue;this._valuesEnd[n]=[this._object[n]].concat(this._valuesEnd[n])}void 0!==this._object[n]&&(this._valuesStart[n]=this._object[n],this._valuesStart[n]instanceof Array==!1&&(this._valuesStart[n]*=1),this._valuesStartRepeat[n]=this._valuesStart[n]||0)}return this},stop:function(){return this._isPlaying&&(this._group.remove(this),this._isPlaying=!1,null!==this._onStopCallback&&this._onStopCallback(this._object),this.stopChainedTweens()),this},end:function(){return this.update(this._startTime+this._duration),this},stopChainedTweens:function(){for(var t=0,n=this._chainedTweens.length;t<n;t++)this._chainedTweens[t].stop()},group:function(t){return this._group=t,this},delay:function(t){return this._delayTime=t,this},repeat:function(t){return this._repeat=t,this},repeatDelay:function(t){return this._repeatDelayTime=t,this},yoyo:function(t){return this._yoyo=t,this},easing:function(t){return this._easingFunction=t,this},interpolation:function(t){return this._interpolationFunction=t,this},chain:function(){return this._chainedTweens=arguments,this},onStart:function(t){return this._onStartCallback=t,this},onUpdate:function(t){return this._onUpdateCallback=t,this},onComplete:function(t){return this._onCompleteCallback=t,this},onStop:function(t){return this._onStopCallback=t,this},update:function(t){var n,e,i;if(t<this._startTime)return!0;for(n in!1===this._onStartCallbackFired&&(null!==this._onStartCallback&&this._onStartCallback(this._object),this._onStartCallbackFired=!0),e=(t-this._startTime)/this._duration,e=0===this._duration||1<e?1:e,i=this._easingFunction(e),this._valuesEnd)if(void 0!==this._valuesStart[n]){var r=this._valuesStart[n]||0,a=this._valuesEnd[n];a instanceof Array?this._object[n]=this._interpolationFunction(a,i):("string"==typeof a&&(a="+"===a.charAt(0)||"-"===a.charAt(0)?r+parseFloat(a):parseFloat(a)),"number"==typeof a&&(this._object[n]=r+(a-r)*i))}if(null!==this._onUpdateCallback&&this._onUpdateCallback(this._object),1!==e)return!0;if(0<this._repeat){for(n in isFinite(this._repeat)&&this._repeat--,this._valuesStartRepeat){if("string"==typeof this._valuesEnd[n]&&(this._valuesStartRepeat[n]=this._valuesStartRepeat[n]+parseFloat(this._valuesEnd[n])),this._yoyo){var s=this._valuesStartRepeat[n];this._valuesStartRepeat[n]=this._valuesEnd[n],this._valuesEnd[n]=s}this._valuesStart[n]=this._valuesStartRepeat[n]}return this._yoyo&&(this._reversed=!this._reversed),void 0!==this._repeatDelayTime?this._startTime=t+this._repeatDelayTime:this._startTime=t+this._delayTime,!0}null!==this._onCompleteCallback&&this._onCompleteCallback(this._object);for(var o=0,u=this._chainedTweens.length;o<u;o++)this._chainedTweens[o].start(this._startTime+this._duration);return!1}},TWEEN.Easing={Linear:{None:function(t){return t}},Quadratic:{In:function(t){return t*t},Out:function(t){return t*(2-t)},InOut:function(t){return(t*=2)<1?.5*t*t:-.5*(--t*(t-2)-1)}},Cubic:{In:function(t){return t*t*t},Out:function(t){return--t*t*t+1},InOut:function(t){return(t*=2)<1?.5*t*t*t:.5*((t-=2)*t*t+2)}},Quartic:{In:function(t){return t*t*t*t},Out:function(t){return 1- --t*t*t*t},InOut:function(t){return(t*=2)<1?.5*t*t*t*t:-.5*((t-=2)*t*t*t-2)}},Quintic:{In:function(t){return t*t*t*t*t},Out:function(t){return--t*t*t*t*t+1},InOut:function(t){return(t*=2)<1?.5*t*t*t*t*t:.5*((t-=2)*t*t*t*t+2)}},Sinusoidal:{In:function(t){return 1-Math.cos(t*Math.PI/2)},Out:function(t){return Math.sin(t*Math.PI/2)},InOut:function(t){return.5*(1-Math.cos(Math.PI*t))}},Exponential:{In:function(t){return 0===t?0:Math.pow(1024,t-1)},Out:function(t){return 1===t?1:1-Math.pow(2,-10*t)},InOut:function(t){return 0===t?0:1===t?1:(t*=2)<1?.5*Math.pow(1024,t-1):.5*(2-Math.pow(2,-10*(t-1)))}},Circular:{In:function(t){return 1-Math.sqrt(1-t*t)},Out:function(t){return Math.sqrt(1- --t*t)},InOut:function(t){return(t*=2)<1?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1)}},Elastic:{In:function(t){return 0===t?0:1===t?1:-Math.pow(2,10*(t-1))*Math.sin(5*(t-1.1)*Math.PI)},Out:function(t){return 0===t?0:1===t?1:Math.pow(2,-10*t)*Math.sin(5*(t-.1)*Math.PI)+1},InOut:function(t){return 0===t?0:1===t?1:(t*=2)<1?-.5*Math.pow(2,10*(t-1))*Math.sin(5*(t-1.1)*Math.PI):.5*Math.pow(2,-10*(t-1))*Math.sin(5*(t-1.1)*Math.PI)+1}},Back:{In:function(t){return t*t*(2.70158*t-1.70158)},Out:function(t){return--t*t*(2.70158*t+1.70158)+1},InOut:function(t){var n=2.5949095;return(t*=2)<1?t*t*((n+1)*t-n)*.5:.5*((t-=2)*t*((n+1)*t+n)+2)}},Bounce:{In:function(t){return 1-TWEEN.Easing.Bounce.Out(1-t)},Out:function(t){return t<1/2.75?7.5625*t*t:t<2/2.75?7.5625*(t-=1.5/2.75)*t+.75:t<2.5/2.75?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375},InOut:function(t){return t<.5?.5*TWEEN.Easing.Bounce.In(2*t):.5*TWEEN.Easing.Bounce.Out(2*t-1)+.5}}},TWEEN.Interpolation={Linear:function(t,n){var e=t.length-1,i=e*n,r=Math.floor(i),a=TWEEN.Interpolation.Utils.Linear;return n<0?a(t[0],t[1],i):1<n?a(t[e],t[e-1],e-i):a(t[r],t[e<r+1?e:r+1],i-r)},Bezier:function(t,n){for(var e=0,i=t.length-1,r=Math.pow,a=TWEEN.Interpolation.Utils.Bernstein,s=0;s<=i;s++)e+=r(1-n,i-s)*r(n,s)*t[s]*a(i,s);return e},CatmullRom:function(t,n){var e=t.length-1,i=e*n,r=Math.floor(i),a=TWEEN.Interpolation.Utils.CatmullRom;return t[0]===t[e]?(n<0&&(r=Math.floor(i=e*(1+n))),a(t[(r-1+e)%e],t[r],t[(r+1)%e],t[(r+2)%e],i-r)):n<0?t[0]-(a(t[0],t[0],t[1],t[1],-i)-t[0]):1<n?t[e]-(a(t[e],t[e],t[e-1],t[e-1],i-e)-t[e]):a(t[r?r-1:0],t[r],t[e<r+1?e:r+1],t[e<r+2?e:r+2],i-r)},Utils:{Linear:function(t,n,e){return(n-t)*e+t},Bernstein:function(t,n){var e=TWEEN.Interpolation.Utils.Factorial;return e(t)/e(n)/e(t-n)},Factorial:function(){var i=[1];return function(t){var n=1;if(i[t])return i[t];for(var e=t;1<e;e--)n*=e;return i[t]=n}}(),CatmullRom:function(t,n,e,i,r){var a=.5*(e-t),s=.5*(i-n),o=r*r;return(2*n-2*e+a+s)*(r*o)+(-3*n+3*e-2*a-s)*o+a*r+n}}},function(t){"function"==typeof define&&define.amd?define([],function(){return TWEEN}):"undefined"!=typeof module&&"object"==typeof exports?module.exports=TWEEN:void 0!==t&&(t.TWEEN=TWEEN)}(this);
}

{



    /**
 * Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs
 * @author mrdoob / http://mrdoob.com/
 * @author yomotsu / https://yomotsu.net/
 */

FLIPBOOK.CSS3DObject = function ( element ) {

    THREE.Object3D.call( this );

    this.type = "CSS3DObject"

    this.element = element;
    this.element.style.position = 'absolute';

    this.addEventListener( 'removed', function () {

        if ( this.element.parentNode !== null ) {

            this.element.parentNode.removeChild( this.element );

        }

    } );

};

FLIPBOOK.CSS3DObject.prototype = Object.create( THREE.Object3D.prototype );
FLIPBOOK.CSS3DObject.prototype.constructor = FLIPBOOK.CSS3DObject;

FLIPBOOK.CSS3DSprite = function ( element ) {

    FLIPBOOK.CSS3DObject.call( this, element );

    this.type = "CSS3DSprite"

};

FLIPBOOK.CSS3DSprite.prototype = Object.create( FLIPBOOK.CSS3DObject.prototype );
FLIPBOOK.CSS3DSprite.prototype.constructor = FLIPBOOK.CSS3DSprite;

//

FLIPBOOK.CSS3DRenderer = function () {

    // console.log( 'THREE.CSS3DRenderer', THREE.REVISION );

    var _width, _height;
    var _widthHalf, _heightHalf;

    var matrix = new THREE.Matrix4();

    var cache = {
        camera: { fov: 0, style: '' },
        objects: new WeakMap()
    };

    var domElement = document.createElement( 'div' );
    domElement.style.overflow = 'hidden';

    this.domElement = domElement;

    var cameraElement = document.createElement( 'div' );

    cameraElement.className = "cameraElement " + Math.random()

    cameraElement.style.WebkitTransformStyle = 'preserve-3d';
    cameraElement.style.transformStyle = 'preserve-3d';

    domElement.appendChild( cameraElement );

    var isIE = /Trident/i.test( navigator.userAgent );

    this.getSize = function () {

        return {
            width: _width,
            height: _height
        };

    };

    this.setSize = function ( width, height ) {

        _width = width;
        _height = height;
        _widthHalf = _width / 2;
        _heightHalf = _height / 2;

        domElement.style.width = width + 'px';
        domElement.style.height = height + 'px';

        cameraElement.style.width = width + 'px';
        cameraElement.style.height = height + 'px';

    };

    function epsilon( value ) {

        return Math.abs( value ) < 1e-10 ? 0 : value;

    }

    function getCameraCSSMatrix( matrix ) {

        var elements = matrix.elements;

        return 'matrix3d(' +
            epsilon( elements[ 0 ] ) + ',' +
            epsilon( - elements[ 1 ] ) + ',' +
            epsilon( elements[ 2 ] ) + ',' +
            epsilon( elements[ 3 ] ) + ',' +
            epsilon( elements[ 4 ] ) + ',' +
            epsilon( - elements[ 5 ] ) + ',' +
            epsilon( elements[ 6 ] ) + ',' +
            epsilon( elements[ 7 ] ) + ',' +
            epsilon( elements[ 8 ] ) + ',' +
            epsilon( - elements[ 9 ] ) + ',' +
            epsilon( elements[ 10 ] ) + ',' +
            epsilon( elements[ 11 ] ) + ',' +
            epsilon( elements[ 12 ] ) + ',' +
            epsilon( - elements[ 13 ] ) + ',' +
            epsilon( elements[ 14 ] ) + ',' +
            epsilon( elements[ 15 ] ) +
        ')';

    }

    function getObjectCSSMatrix( matrix, cameraCSSMatrix ) {

        var elements = matrix.elements;
        var matrix3d = 'matrix3d(' +
            epsilon( elements[ 0 ] ) + ',' +
            epsilon( elements[ 1 ] ) + ',' +
            epsilon( elements[ 2 ] ) + ',' +
            epsilon( elements[ 3 ] ) + ',' +
            epsilon( - elements[ 4 ] ) + ',' +
            epsilon( - elements[ 5 ] ) + ',' +
            epsilon( - elements[ 6 ] ) + ',' +
            epsilon( - elements[ 7 ] ) + ',' +
            epsilon( elements[ 8 ] ) + ',' +
            epsilon( elements[ 9 ] ) + ',' +
            epsilon( elements[ 10 ] ) + ',' +
            epsilon( elements[ 11 ] ) + ',' +
            epsilon( elements[ 12 ] ) + ',' +
            epsilon( elements[ 13 ] ) + ',' +
            epsilon( elements[ 14 ] ) + ',' +
            epsilon( elements[ 15 ] ) +
        ')';

        if ( isIE ) {

            return 'translate(-50%,-50%)' +
                'translate(' + _widthHalf + 'px,' + _heightHalf + 'px)' +
                cameraCSSMatrix +
                matrix3d;

        }

        return 'translate(-50%,-50%)' + matrix3d;

    }

    function renderObject( object, camera, cameraCSSMatrix ) {

        if ( object instanceof FLIPBOOK.CSS3DObject ) {
        // if ( object.type == "CSS3DObject" ) {

            var style;

            if ( object instanceof FLIPBOOK.CSS3DSprite ) {
            // if ( object.type == "CSS3DSprite" ) {

                // http://swiftcoder.wordpress.com/2008/11/25/constructing-a-billboard-matrix/

                matrix.copy( camera.matrixWorldInverse );
                matrix.transpose();
                matrix.copyPosition( object.matrixWorld );
                matrix.scale( object.scale );

                matrix.elements[ 3 ] = 0;
                matrix.elements[ 7 ] = 0;
                matrix.elements[ 11 ] = 0;
                matrix.elements[ 15 ] = 1;

                style = getObjectCSSMatrix( matrix, cameraCSSMatrix );

            } else {

                style = getObjectCSSMatrix( object.matrixWorld, cameraCSSMatrix );

            }

            var element = object.element;
            var cachedStyle = cache.objects.get( object );

            if ( cachedStyle === undefined || cachedStyle !== style ) {

                element.style.WebkitTransform = style;
                element.style.transform = style;

                var objectData = { style: style };

                if ( isIE ) {

                    objectData.distanceToCameraSquared = getDistanceToSquared( camera, object );

                }

                cache.objects.set( object, objectData );

            }

            // console.log(element.className)

            if ( element.parentNode !== cameraElement ) {

                cameraElement.appendChild( element );

            }

        }

        for ( var i = 0, l = object.children.length; i < l; i ++ ) {

            renderObject( object.children[ i ], camera, cameraCSSMatrix );

        }

    }

    var getDistanceToSquared = function () {

        var a = new THREE.Vector3();
        var b = new THREE.Vector3();

        return function ( object1, object2 ) {

            a.setFromMatrixPosition( object1.matrixWorld );
            b.setFromMatrixPosition( object2.matrixWorld );

            return a.distanceToSquared( b );

        };

    }();

    function filterAndFlatten( scene ) {

        var result = [];

        scene.traverse( function ( object ) {

            if ( object instanceof FLIPBOOK.CSS3DObject ) result.push( object );

        } );

        return result;

    }

    function zOrder( scene ) {

        var sorted = filterAndFlatten( scene ).sort( function ( a, b ) {

            var distanceA = cache.objects.get( a ).distanceToCameraSquared;
            var distanceB = cache.objects.get( b ).distanceToCameraSquared;

            return distanceA - distanceB;

        } );

        var zMax = sorted.length;

        for ( var i = 0, l = sorted.length; i < l; i ++ ) {

            sorted[ i ].element.style.zIndex = zMax - i;

        }

    }

    this.render = function ( scene, camera ) {

        var fov = camera.projectionMatrix.elements[ 5 ] * _heightHalf;

        if ( cache.camera.fov !== fov ) {

            if ( camera.isPerspectiveCamera ) {

                domElement.style.WebkitPerspective = fov + 'px';
                domElement.style.perspective = fov + 'px';

            }

            cache.camera.fov = fov;

        }

        scene.updateMatrixWorld();

        if ( camera.parent === null ) camera.updateMatrixWorld();

        var cameraCSSMatrix = camera.isOrthographicCamera ?
            'scale(' + fov + ')' + getCameraCSSMatrix( camera.matrixWorldInverse ) :
            'translateZ(' + fov + 'px)' + getCameraCSSMatrix( camera.matrixWorldInverse );

        var style = cameraCSSMatrix +
            'translate(' + _widthHalf + 'px,' + _heightHalf + 'px)';

        if ( cache.camera.style !== style && ! isIE ) {

            cameraElement.style.WebkitTransform = style;
            cameraElement.style.transform = style;

            cache.camera.style = style;

        }

        renderObject( scene, camera, cameraCSSMatrix );

        if ( isIE ) {

            // IE10 and 11 does not support 'preserve-3d'.
            // Thus, z-order in 3D will not work.
            // We have to calc z-order manually and set CSS z-index for IE.
            // FYI: z-index can't handle object intersection
            zOrder( scene );

        }

    };

};




}