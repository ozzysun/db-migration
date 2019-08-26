module.exports = {
  hello: (parent, args, context, info) => {
    console.log('parent')
    console.log(parent)
    console.log('args')
    console.log(args)
    // console.log('context')
    // console.log(context)
    console.log('info')
    console.log(info)
    return `hello ${args.name}`
  },
  oz: () => {
    return `Im ozzysun`
  }
}
