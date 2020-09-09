import PropTypes from 'prop-types';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import AutoImage from './autoImage1';
import htmlParse from './htmlParse';
const BULLET = '  \u2022  ';
const LINE_BREAK = '\n';
const { height, width } = Dimensions.get('window');


/*function rendCodeBlock(codeText, styles) {
    let codeLines = codeText.split('\n');
    return codeLines.map(function (line, index, arr) {
        let lineNum = index + 1;
        if (line == '')
            line = '\n';
        if (index == codeLines.length - 1)
            return null;
        return (
            <View key={'codeRow' + index} style={styles.codeRow}>
                <View style={styles.lineNumWrapper}>
                    <Text style={styles.lineNum}>
                        {lineNum + '.'}
                    </Text>
                </View>

                <View style={styles.codeLineWrapper}>
                    <Text style={styles.codeLine}>
                        {line}
                    </Text>
                </View>
            </View>
        );
    });
}*/
function getArray(node) {
    return node.some((node, index, list) => {
        return index === 0 && node.name === 'img';
    })
}
function getName(node) {
    let isImg;
    isImg = node.some((node, index, list) => {
        if (Array.isArray(node.children))
            return getArray(node.children);
        else
            return index === 0 && node.name === 'img';
    })

    return isImg;
}
function getCodeRowStyle(num, length, styles) {
    if (num == 1 && length == num) {
        return [styles.codeRow, styles.codeFirstAndLastRow];
    }

    if (num == 1) {
        return [styles.codeRow, styles.codeFirstRow];
    }
    if (num == length) {
        return [styles.codeRow, styles.codeLastRow];
    }

    return styles.codeRow;
}

const _getDefaultStyle = function (str) {
    //  console.log(str);
    if (str == undefined || str == '') {

        return '';
    }

    var styleItems = {};
    let Items = String(str).split(';');
    for (var item in Items) {
        if (Items[item] == "")
            break;
        let styles = Items[item].split(':');
        if (styles[0].replace(/^\s\s*/, '').replace(/\s\s*$/, '') == 'font-size')
            styleItems['fontSize'] = parseInt(styles[1].replace('px', '')) - 4;
        if (styles[0].replace(/^\s\s*/, '').replace(/\s\s*$/, '') == 'background-color')
            styleItems['backgroundColor'] = String(styles[1]);
        if (styles[0].replace(/^\s\s*/, '').replace(/\s\s*$/, '') == 'color')
            styleItems['color'] = String(styles[1].replace(/^\s\s*/, '').replace(/\s\s*$/, ''));
    }

    return styleItems;
}
const htmlToElement = function (rawHtml, opts, done) {
    let styles = opts.styles;

    function domToElement(dom, parent, type) {
        if (!dom)
            return null;

        return dom.map((node, index, list) => {
            if (opts.customRenderer) {
                let rendered = opts.customRenderer(node, index, parent, type);
                if (rendered || rendered === null)
                    return rendered;
            }

            let name = node.name;
            // let nodeStyle=node.parent.attribs?node.parent.attribs.style:'';
            // var nodeStyles=_getDefaultStyle(nodeStyle);
            // var size=nodeStyles['fontSize']?(nodeStyles['fontSize']+fontSize):(15+fontSize);


            if (name == 'text' && type == 'inline') {
                const content = node.text.replace(/[\r\n]/g, '');
                if (node.text.charCodeAt() === 13)
                    return;

                return (
                    content ? <Text key={index} style={styles.p}>{content}</Text> : null
                )
            }

            if (node.type == 'inline' && type == 'block') {

                let child = node.children;

                if (Array.isArray(child)) {

                    return (<View key={index} style={{ flex: 1 }}>
                        {domToElement(node.children, node, 'block')}
                    </View>
                    )
                }
                else {
                    return (<View key={index} style={{ flex: 1 }}>
                        {domToElement(node.children, node, 'inline')}
                    </View>)
                }
            }

            if (node.type == 'inline') {
                let uri = node.attribs.href;
                if (name == 'a') {

                    return (
                        <Text
                            onPress={opts.linkHandler.bind(this, uri)}
                            key={index} style={[styles[name], styles.p]}>
                            {domToElement(node.children, node, 'inline')}
                        </Text>
                    )

                }

                return (
                    <Text key={index} style={[styles[name], styles.p]}>
                        {domToElement(node.children, node, 'inline')}

                    </Text>
                );
            }
            if (node.type == 'block' && type == 'block') {
                if (name == 'img') {
                    let uri = node.attribs.src;
                    let images = opts.images;
                    let Index;
                    images ? images.forEach(function (item, index, array) {
                        if (uri == item.uri)
                            Index = index;
                    }) : Index = 0;
                    images == null ? images = [{ uri: uri }] : images;
                    return (
                        <AutoImage key={index} source={{ uri: node.attribs.src }}
                            imgStyle={[styles.img, { flex: 1, resizeMode: 'stretch' }]}
                            style={styles.img}
                            backgroundStyle={styles.img}
                            startCapture={true}
                            imgCapture={true}
                            moveCapture={true}
                            images={images}
                            imageWidth={opts.imageWidth}
                            imageHeight={opts.imageHeight}
                            index={Index} />
                    )
                }
                if (name == 'hr') {
                    return (
                        <View key={index} style={{ backgroundColor: 'gray', height: 0.5, marginTop: 10 }}></View>
                    )
                }
                if (node.children && getName(node.children)) {
                    return (
                        <View key={index} style={styles[name + 'wrapper']}>
                            <View style={styles[name + 'InnerWrapper']}>
                                {domToElement(node.children, node, 'block')}
                            </View>
                            <Text style={styles.p}>
                                {domToElement(node.children, node, 'inline')}
                            </Text>

                        </View>
                    );
                }
                else if (!node.children && !node.text)
                    return null;

                else {
                    return (
                        <View key={index} style={styles[name + 'wrapper']}>
                            <Text style={styles.p}>
                                {domToElement(node.children, node, 'inline')}
                                {/*{node.name == 'br' ? LINE_BREAK : null}*/}
                            </Text>
                            <View style={styles[name + 'InnerWrapper']}>
                                {domToElement(node.children, node, 'block')}
                            </View>
                        </View>
                    );
                }


            }
        })

    }

    htmlParse(rawHtml, function (dom) {
        done(null, domToElement(dom, null, 'block'));
    })
}


export default class HtmlView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            element: null,
        }
    }

    componentWillReceiveProps(props) {
        this.props = props;
        fontSize = this.props.fontSize;
        this.startHtmlRender();
    }

    componentDidMount() {
        fontSize = this.props.fontSize;
        this.startHtmlRender();

    }

    startHtmlRender() {
        if (!this.props.value)
            return;
        if (this.renderingHtml)
            return;

        let opts = {
            linkHandler: this.props.onLinkPress,
            linkImage: this.props.onPress,
            images: this.props.images,
            imageWidth: this.props.imgWidth,
            imageHeight: this.props.imgHeight,
            styles: Object.assign({}, baseStyles, this.props.stylesheet),
            customRenderer: this.props.renderNode
        };

        this.renderingHtml = true;
        htmlToElement(this.props.value, opts, (err, element) => {
            this.renderingHtml = false;

            if (err)
                return (this.props.onError || console.error)(err);
            this.setState({
                element: element
            });
        });
    }

    render() {

        if (this.state.element) {
            return (<View children={this.state.element} style={{ flex: 1, marginBottom: 0, }} />);
        }
        return (<View style={{ flex: 1 }} />);
    }
}

HtmlView.propTypes = {
    value: PropTypes.string,
    stylesheet: PropTypes.object,
    onLinkPress: PropTypes.func,
    renderNode: PropTypes.func
}

fontSize = 0;
titleMargin = 15;
liFontSize = 15 - 2;

const baseStyles = StyleSheet.create({
    img: {
        // width: width-20,
        // height: width/2,
        flex: 1,
        resizeMode: "contain",
        marginBottom: 10,
        marginTop: 10,
        // backgroundColor:'red',

    },
    span: {
        flex: 1,

    },
    // p: {
    //
    //     fontSize: fontSize,
    //     flex:1,
    //     lineHeight: fontSize * 1.3,
    // },

    a: {
        color: '#3498DB',
        fontSize: fontSize,
        paddingLeft: 4,
        paddingRight: 4,
        marginRight: 10,
        marginLeft: 10,
        fontFamily: 'Courier',
        lineHeight: fontSize * 1.5,


    },
    h1: {
        flex: 1,
        fontSize: fontSize * 1.4,
        fontWeight: "bold",
        color: 'rgba(0,0,0,0.8)',

    },
    h1wrapper: {
        marginTop: titleMargin,
        marginBottom: titleMargin,

    },
    h2: {
        fontSize: fontSize * 1.5,
        fontWeight: 'bold',
        color: 'rgba(0,0,0,0.85)',

    },
    h2wrapper: {
        marginBottom: titleMargin,
        marginTop: titleMargin
    },
    h3: {
        fontWeight: 'bold',
        fontSize: fontSize * 1.4,
        color: 'rgba(0,0,0,0.8)'
    },
    h3wrapper: {
        marginBottom: titleMargin - 2,
        marginTop: titleMargin - 2
    },
    h4: {
        fontSize: fontSize * 1.3,
        color: 'rgba(0,0,0,0.7)',
        fontWeight: 'bold'
    },
    h4wrapper: {
        marginBottom: titleMargin - 2,
        marginTop: titleMargin - 2,
    },
    h5: {
        fontSize: fontSize * 1.2,
        color: 'rgba(0,0,0,0.7)',
        fontWeight: 'bold'
    },
    h5wrapper: {
        marginBottom: titleMargin - 3,
        marginTop: titleMargin - 3,
    },
    h6: {
        fontSize: fontSize * 1.1,
        color: 'rgba(0,0,0,0.7)',
        fontWeight: 'bold'
    },
    h6wrapper: {
        marginBottom: titleMargin - 3,
        marginTop: titleMargin - 3,
    },
    li: {
        fontSize: fontSize * 0.9,
        color: 'rgba(0,0,0,0.7)'
    },
    liwrapper: {
        paddingLeft: 5,
        marginBottom: 5
    },
    strong: {
        fontWeight: 'bold',
        flex: 1,
    },
    em: {
        fontStyle: 'italic'
    },
    code: {
        color: '#E74C3C',
        paddingLeft: 5,
        paddingRight: 5,
        fontFamily: 'Courier'

    },
    codeScrollView: {
        //paddingBottom: 15,
        //paddingRight: 15,
        //paddingLeft: 15,
        //paddingTop: 15,
        backgroundColor: '#333',
        flexDirection: 'column',
        marginBottom: 5
    },
    codeRow: {
        flex: 1,
        flexDirection: 'row',
        height: 25,
        alignItems: 'center'
    },
    codeFirstRow: {
        paddingTop: 10,
        height: 25 + 20
    },
    codeLastRow: {
        paddingBottom: 10,
        height: 25 + 20
    },
    codeFirstAndLastRow: {
        paddingBottom: 10,
        height: 25 + 40,
        paddingTop: 10
    },
    lineNum: {
        width: 55,
        color: 'rgba(255,255,255,0.5)',
        //backgroundColor: 'rgba(29,29,29,1)',
        //height: 25
    },
    lineNumWrapper: {
        width: 55,
        height: 25,
        backgroundColor: 'rgba(0,0,0,0.1)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        //paddingTop: 20
    },
    codeLine: {
        color: '#E74C3C',
        fontFamily: 'Courier'
    },
    codeWrapper: {
        flexDirection: 'column'
    },
    codeLineWrapper: {
        height: 10,
        //backgroundColor: 'rgba(0,0,0,0.1)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10
    },
    blockquotewrapper: {
        paddingLeft: 10,
        borderLeftColor: '#3498DB',
        borderLeftWidth: 3
    }
});
