import React, { Fragment, useContext, useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { TypeScreenContext } from 'src/layout/_core/SplashScreen'
import HomeGoogleSheet from './components/HomeGoogleSheet'
import RotationLuck from './RotationLuck'

const initialValues = [
  {
    text1: '',
    text2: 'chưa chắc',
    img: '',
    size_img: 50,
    size_text: 15,
    color_text: '#e66465',
    font_text: "Barlow"
  },
  {
    text1: 'Không giòn',
    text2: '',
    img: '',
    size_img: 50,
    size_text: 15,
    color_text: '#ffffff',
    font_text: "Poppins"
  },
  {
    text1: '===============',
    text2: '===============',
    img: '',
    size_img: 50,
    size_text: 15,
    color_text: '#000',
    font_text: "Barlow"
  },
  {
    text1: 'Không giòn',
    text2: '',
    img: '',
    size_img: 50,
    size_text: 16,
    color_text: '#ffffff',
    font_text: "Poppins"
  },
  {
    text1: '=========',
    text2: '=========',
    img: '',
    size_img: 50,
    size_text: 20,
    color_text: '#000',
    font_text: "Barlow"
  },
  {
    text1: 'Không giòn',
    text2: 'chưa chắc',
    img: '',
    size_img: 50,
    size_text: 20,
    color_text: '#000',
    font_text: "Poppins"
  },
  {
    text1: 'Không giòn',
    text2: 'chưa chắc',
    img: '',
    size_img: 50,
    size_text: 20,
    color_text: '#000',
    font_text: "Barlow",
  },
  {
    text1: 'Không giòn',
    text2: '',
    img: '',
    size_img: 50,
    size_text: 17,
    color_text: '#ffffff',
    font_text: "Poppins"
  }
]

export default function Home() {
  const { type: Type } = useContext(TypeScreenContext)
  const [data, setData] = useState(initialValues)

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      dataWheel: []
    }
  })
  const { fields, append } = useFieldArray({
    control,
    name: 'dataWheel'
  })
  const second = useWatch({
    control,
    name: 'dataWheel'
  })

  useEffect(() => {
    setValue('dataWheel', data, { shouldValidate: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    console.log(second)
    setData(second)
  }, [second])

  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file)
      fileReader.onload = () => {
        resolve(fileReader.result);
      }
      fileReader.onerror = (error) => {
        reject(error);
      }
    })
  }

  const width = 500
  const height = 500
  const type = 'Mau2'

  return (
    <Fragment>
      {!Type && <HomeGoogleSheet />}
      {Type === 'admin' && 'admin'}
      {Type === 'member' && 'member'}
      {Type === 'canvas' && (
        <div className="d-flex px-50px align-items-center" style={{height: "100vh"}}>
            <div className="flex-1">
              <div>
                <form onSubmit={handleSubmit(data => console.log(data))}>
                  {fields.map((item, index) => (
                    <div className="d-flex mb-15px" key={index}>
                      <div className="form-group">
                        <Controller
                          render={({ field }) => (
                            <input {...field} className="form-control" />
                          )}
                          name={`dataWheel.${index}.text1`}
                          control={control}
                        />
                      </div>
                      <div className="form-group ml-10px">
                        <Controller
                          render={({ field }) => (
                            <input {...field} className="form-control" />
                          )}
                          name={`dataWheel.${index}.text2`}
                          control={control}
                        />
                      </div>
                      <div className="form-group ml-10px">
                        <Controller
                          render={({ field }) => (
                            <select value={field.value} className="form-control" onChange={(e) =>{
                              field.onChange(e.target.value);
                            }}>
                              <option value="Barlow">'Barlow', sans-serif</option>
                              <option value="Poppins">'Poppins', sans-serif</option>
                            </select>
                          )}
                          name={`dataWheel.${index}.font_text`}
                          control={control}
                        />
                      </div>
                      <div className="form-group ml-10px w-50px">
                        <Controller
                          render={({ field }) => (
                            <input {...field} className="form-control text-center" />
                          )}
                          name={`dataWheel.${index}.size_text`}
                          control={control}
                        />
                      </div>
                      <div className="form-group ml-10px w-50px">
                        <Controller
                          render={({ field }) => (
                            <input
                              {...field}
                              type="color"
                              className="form-control"
                            />
                          )}
                          name={`dataWheel.${index}.color_text`}
                          control={control}
                          type="color"
                        />
                      </div>
                      <div className="form-group ml-10px w-105px">
                        <Controller
                          render={({ field }) => (
                              <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files[0]
                                  const base64 = await convertBase64(file)
                                  field.onChange(base64)
                                }}
                              />
                          )}
                          name={`dataWheel.${index}.img`}
                          control={control}
                          type="color"
                        />
                      </div>
                    </div>
                  ))}
                </form>
              </div>
            </div>
            <div className="w-500px">
              <RotationLuck
                data={data}
                width={width}
                height={height}
                type={type}
              />
            </div>
        </div>
      )}
    </Fragment>
  )
}
