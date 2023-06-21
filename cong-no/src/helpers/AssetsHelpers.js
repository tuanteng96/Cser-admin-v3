import { DevHelpers } from './DevHelpers'

export const AssetsHelpers = {
  toAbsoluteUrl: pathname => process.env.PUBLIC_URL + pathname,
  toUrlServer: pathname =>
    DevHelpers.isDevelopment()
      ? process.env.REACT_APP_API_URL + pathname
      : '' + pathname,
  toUrlAvatarServer: pathname => {
    if (!pathname)
      return AssetsHelpers.toAbsoluteUrl('/_assets/images/no-avatar.png')
    return DevHelpers.isDevelopment()
      ? process.env.REACT_APP_API_URL + '/upload/image/' + pathname
      : '/upload/image/' + pathname
  }
}
