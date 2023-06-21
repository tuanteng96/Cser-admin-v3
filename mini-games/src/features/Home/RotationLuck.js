import React from 'react';
import { useEffect, useState } from 'react';
import { Stage, Layer, Image, Text, Transformer } from 'react-konva';
import useImage from "use-image";

const FindLocationText = (data, width, height, type) => {
  var initialValues = [];

  for (var i = 0; i < data.length; i++) {
    initialValues.push({
      option: "",
      option_1: data[i].text1,
      option_2: data[i].text2,
      x: 0,
      y: 0,
      x2: 0,
      y2: 0,
      size_text: data[i].size_text,
      color_text: data[i].color_text,
      font_text: data[i].font_text,
      rotation: 0,
      id: "text1_" + (i + 2),
      id_2: "text2_" + (i + 2),
      id_img: "img_" + (i + 2),
      url: data[i].img,
      x_i: 0,
      y_i: 0,
      width_i: data[i].size_img,
      height_i: data[i].size_img,
      rotation_i: 0
    });
  }

  const slicesCount = initialValues.length;

  const max_width = width / 2;
  const max_height = height / 2;
  const ChuViNho = width / 8;
  const ChuViVuong = ChuViNho * 2.5;

  const DoXoayCoBan = 360 / slicesCount;

  let DoXoay = DoXoayCoBan / 2;

  function start_values() {
    for (let i = 0; i < initialValues.length; i++) {
      initialValues[i].x = getPositionX(i, ChuViNho, 1);
      initialValues[i].y = getPositionY(i, ChuViNho, 1);
      initialValues[i].rotation = getRotation(i);
      if (type === 1){
        initialValues[i].option = initialValues[i].option_1;
        initialValues[i].x = getPositionX(i, ChuViNho, 1);
        initialValues[i].y = getPositionY(i, ChuViNho, 1);
      }else{
        initialValues[i].option = initialValues[i].option_2;
        initialValues[i].x = getPositionX(i, ChuViNho, 2);
        initialValues[i].y = getPositionY(i, ChuViNho, 2);
        initialValues[i].rotation += 0;
      }

      initialValues[i].x_i = getPositionX(i, ChuViVuong, 0);
      initialValues[i].y_i = getPositionY(i, ChuViVuong, 0);
      initialValues[i].rotation_i = getRotation(i);
    }
  }

  const getPositionX = (index, ChuVi, type) => {
    let ToaDo = max_width + ChuVi * Math.cos((getRotation2(index, type)));
    return ToaDo;
  };

  const getPositionY = (index, ChuVi, type) => {
    let ToaDo = max_height + ChuVi * Math.sin((getRotation2(index, type)));
    return ToaDo;
  };

  const getRotation = (index) => {
    return DoXoay + index * DoXoayCoBan - 90 ;
  };

  const getRotation2 = (index, type) => {
    let Xoay = 0;
    let XuLy = initialValues.length - 5;
    for (let j = 0; j <= index; j++) {
      Xoay += DoXoayCoBan;
    }
    XuLy = 130 - XuLy * 4;
    if (slicesCount >= 8) {
      XuLy += (slicesCount - 8) * 2;
    }
    if (initialValues[index].option_1.length > 0 && initialValues[index].option_2.length > 0) {
      if (type === 1) {
        XuLy += initialValues[index].size_text / 2 + 1;
      } else if (type === 0) {
        XuLy += 0;
      } else {
        XuLy -= initialValues[index].size_text / 2 - 4;
      }
    }
    return (Xoay - XuLy) * Math.PI / 180;
  };

  start_values();

  return initialValues;
}

const BackGroundImage = ({ x, y, rotation, width, height, src }) => {
  const [image, setImage] = useState(null);
  useEffect(() => {
    loadImage();
  });
  const loadImage = () => {
    let img = new window.Image();
    img.src = src;
    img.onload = () => {
      setImage(img);
    };
  };
  return <Image x={x} y={y} image={image} width={width} height={height} rotation={rotation} />;
};

const Rectangle = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);
  
  return (
    <React.Fragment>
      <Text
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        text={shapeProps.option}
        x={shapeProps.x}
        y={shapeProps.y}
        rotation={shapeProps.rotation}
        fontSize={shapeProps.size_text}
        fill={shapeProps.color_text}
        fontFamily={shapeProps.font_text}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          onChange({
            ...shapeProps,
          });
        }}
      />

      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const RectangleImg = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const [image] = useImage(shapeProps.url);
  return (
    <React.Fragment>
      <Image
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}

        x={shapeProps.x_i}
        y={shapeProps.y_i}
        image={image}
        width={shapeProps.height_i}
        height={shapeProps.width_i}
        rotation={shapeProps.rotation_i}

        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          onChange({
            ...shapeProps,
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

export default function RotationLuck({ data, width, height, type }) {

  const initialValues = FindLocationText(data, width, height , 1);
  const initial2Values = FindLocationText(data, width, height , 2);
  const initialValueImage = FindLocationText(data, width, height , 2);

  const src_url = "https://quayso.vn/img/AnhVongQuay/" + type + "/" + type + "_" + (initialValues.length) + ".png";

  const [rectangles, setRectangles] = React.useState(initialValues);
  const [selectedId, selectShape] = React.useState(null);

  const [Image, setImage] = React.useState(initialValueImage);
  const [initial, setInitial] = React.useState(initial2Values);


  const checkDeselect = (e) => {

    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
    if (e.target.attrs.height === height) {
      selectShape(null);
    }
  };

  return (
      <Stage
        width={width} height={height}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
      >
        <Layer>
          <BackGroundImage
            src={src_url}
            rotation={0}
            width={width}
            height={height}
            x={0}
            y={0}
          />
          {initialValues.map((rect, i) => {
            return (
              <Rectangle
                key={i}
                shapeProps={rect}
                isSelected={rect.id === selectedId}
                onSelect={() => {
                  selectShape(rect.id);
                }}
                onChange={(newAttrs) => {
                  const rects = rectangles.slice();
                  rects[i] = newAttrs;
                  setRectangles(rects);
                }}
              />
            );
          })}
          {initial2Values.map((rect, i) => {
            return (
              <Rectangle
                key={i}
                shapeProps={rect}
                isSelected={rect.id_2 === selectedId}
                onSelect={() => {
                  selectShape(rect.id_2);
                }}
                onChange={(newAttrs) => {
                  const rects = initial.slice();
                  rects[i] = newAttrs;
                  setInitial(rects);
                }}
              />
            );
          })}
          {initialValueImage.map((rect, i) => {
            return (
              <RectangleImg
                key={i}
                shapeProps={rect}
                isSelected={rect.id_img === selectedId}
                onSelect={() => {
                  selectShape(rect.id_img);
                }}
                onChange={(newAttrs) => {
                  const rects = Image.slice();
                  rects[i] = newAttrs;
                  setImage(rects);
                }}
              />
            );
          })}
        </Layer>
      </Stage>
  );
}