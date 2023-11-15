const main = async (): Promise<boolean> => {
    //start rendering

    return true;
}

main().then((rendered: boolean) => {
    if(rendered){
        console.log('STUFF GOT RENDERED')
    }else{
        throw new Error('STUFF NOT RENDERED');
    }
})